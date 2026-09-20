import "server-only";

import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import { moneyToCents } from "@/lib/money";

/**
 * PropertyService
 * ---------------
 *
 * This service owns the business rules around:
 *
 * Property
 *   ↓
 * Unit / Room
 *   ↓
 * RentableSpace
 *
 * SECURITY PRINCIPLE:
 *
 * IDs coming from URLs/forms are NOT authorization.
 *
 * This:
 *
 *   propertyId = "abc123"
 *
 * only identifies a record.
 *
 * We still have to prove:
 *
 *   property.landlordAccountId === authenticated landlord
 *
 * before updating anything.
 */

const propertyTypes = {
  BOARDING_HOUSE: "BOARDING_HOUSE",
  APARTMENT: "APARTMENT",
  DORMITORY: "DORMITORY",
  BEDSPACE: "BEDSPACE",
  HOUSE: "HOUSE",
  COMMERCIAL: "COMMERCIAL",
  OTHER: "OTHER",
} as const;

type PropertyType =
  keyof typeof propertyTypes;

type UpdatePropertyInput = {
  landlordAccountId: string;
  propertyId: string;

  name: string;
  type: PropertyType;

  addressLine1?: string | null;
  addressLine2?: string | null;
  barangay?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  description?: string | null;
};

export async function updateProperty(
  input: UpdatePropertyInput,
) {
  const name =
    input.name.trim();

  if (!name) {
    throw new AppError(
      "Property name is required.",
    );
  }

  if (
    !propertyTypes[
    input.type
    ]
  ) {
    throw new AppError(
      "Invalid property type.",
    );
  }

  /**
   * DATA ISOLATION:
   *
   * updateMany lets us include ownership directly
   * in the update condition.
   *
   * If the property belongs to another landlord,
   * count will be 0.
   */
  const result =
    await prisma.property.updateMany({
      where: {
        id: input.propertyId,

        landlordAccountId:
          input.landlordAccountId,

        deletedAt: null,
      },

      data: {
        name,

        type:
          input.type,

        addressLine1:
          input.addressLine1?.trim() ||
          null,

        addressLine2:
          input.addressLine2?.trim() ||
          null,

        barangay:
          input.barangay?.trim() ||
          null,

        city:
          input.city?.trim() ||
          null,

        province:
          input.province?.trim() ||
          null,

        postalCode:
          input.postalCode?.trim() ||
          null,

        description:
          input.description?.trim() ||
          null,
      },
    });

  if (
    result.count !== 1
  ) {
    throw new AppError(
      "Property not found.",
    );
  }
}

export async function archiveProperty({
  landlordAccountId,
  propertyId,
}: {
  landlordAccountId: string;
  propertyId: string;
}) {
  /**
   * First prove ownership.
   */
  const property =
    await prisma.property.findFirst({
      where: {
        id: propertyId,

        landlordAccountId,

        deletedAt: null,
      },

      select: {
        id: true,

        units: {
          where: {
            deletedAt: null,
          },

          select: {
            id: true,
          },
        },
      },
    });

  if (!property) {
    throw new AppError(
      "Property not found.",
    );
  }

  /**
   * SAFETY RULE:
   *
   * Never archive a property that still has
   * an active tenant lease.
   *
   * Otherwise:
   *
   * Tenant still renting Room 101
   *           +
   * Property disappears
   *
   * would create contradictory business state.
   */
  const activeLease =
    await prisma.lease.findFirst({
      where: {
        status: "ACTIVE",
        deletedAt: null,

        rentableSpace: {
          is: {
            unit: {
              is: {
                propertyId,
              },
            },
          },
        },
      },

      select: {
        id: true,
      },
    });

  if (activeLease) {
    throw new AppError(
      "This property still has an active lease. End all active leases before archiving it.",
    );
  }

  const unitIds =
    property.units.map(
      (unit) => unit.id,
    );

  const now =
    new Date();

  /**
   * TRANSACTION:
   *
   * Archiving a Property also retires its Units
   * and RentableSpaces.
   *
   * These must succeed together.
   *
   * We DO NOT delete historical:
   *
   * Lease
   * RentCharge
   * Payment
   * Expense
   *
   * because those are part of business history.
   */
  await prisma.$transaction(
    async (tx) => {
      if (
        unitIds.length > 0
      ) {
        await tx.rentableSpace.updateMany({
          where: {
            unitId: {
              in: unitIds,
            },

            deletedAt: null,
          },

          data: {
            status:
              "INACTIVE",

            deletedAt:
              now,
          },
        });

        await tx.unit.updateMany({
          where: {
            id: {
              in: unitIds,
            },

            deletedAt: null,
          },

          data: {
            status:
              "INACTIVE",

            deletedAt:
              now,
          },
        });
      }

      await tx.property.update({
        where: {
          id:
            property.id,
        },

        data: {
          isActive:
            false,

          deletedAt:
            now,
        },
      });
    },
  );
}

/**
 * UNIT / ROOM EDITING
 */

export async function updateUnit({
  landlordAccountId,
  propertyId,
  unitId,
  name,
  floor,
  description,
}: {
  landlordAccountId: string;
  propertyId: string;
  unitId: string;

  name: string;
  floor?: string | null;
  description?: string | null;
}) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    throw new AppError(
      "Room or unit name is required.",
    );
  }

  /**
   * Validate the complete ownership chain:
   *
   * Unit
   *   ↓
   * Property
   *   ↓
   * Landlord
   */
  const unit =
    await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId,

        deletedAt: null,

        property: {
          is: {
            landlordAccountId,

            deletedAt: null,
          },
        },
      },

      select: {
        id: true,
      },
    });

  if (!unit) {
    throw new AppError(
      "Room or unit not found.",
    );
  }

  await prisma.unit.update({
    where: {
      id:
        unit.id,
    },

    data: {
      name:
        cleanName,

      floor:
        floor?.trim() ||
        null,

      description:
        description?.trim() ||
        null,
    },
  });
}

export async function archiveUnit({
  landlordAccountId,
  propertyId,
  unitId,
}: {
  landlordAccountId: string;
  propertyId: string;
  unitId: string;
}) {
  const unit =
    await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId,

        deletedAt: null,

        property: {
          is: {
            landlordAccountId,

            deletedAt: null,
          },
        },
      },

      include: {
        rentableSpaces: {
          where: {
            deletedAt: null,
          },

          select: {
            id: true,
          },
        },
      },
    });

  if (!unit) {
    throw new AppError(
      "Room or unit not found.",
    );
  }

  const spaceIds =
    unit.rentableSpaces.map(
      (space) =>
        space.id,
    );

  if (
    spaceIds.length > 0
  ) {
    const activeLease =
      await prisma.lease.findFirst({
        where: {
          rentableSpaceId: {
            in: spaceIds,
          },

          status:
            "ACTIVE",

          deletedAt:
            null,
        },

        select: {
          id: true,
        },
      });

    if (activeLease) {
      throw new AppError(
        "This room still has an occupied space. End the active lease before archiving it.",
      );
    }
  }

  const now =
    new Date();

  await prisma.$transaction(
    async (tx) => {
      if (
        spaceIds.length > 0
      ) {
        await tx.rentableSpace.updateMany({
          where: {
            id: {
              in: spaceIds,
            },

            deletedAt:
              null,
          },

          data: {
            status:
              "INACTIVE",

            deletedAt:
              now,
          },
        });
      }

      await tx.unit.update({
        where: {
          id:
            unit.id,
        },

        data: {
          status:
            "INACTIVE",

          deletedAt:
            now,
        },
      });
    },
  );
}

/**
 * RENTABLE SPACE EDITING
 */

export async function updateRentableSpace({
  landlordAccountId,
  propertyId,
  unitId,
  rentableSpaceId,
  name,
  defaultRent,
}: {
  landlordAccountId: string;
  propertyId: string;
  unitId: string;
  rentableSpaceId: string;

  name: string;
  defaultRent: string;
}) {
  const cleanName =
    name.trim();

  if (!cleanName) {
    throw new AppError(
      "Space name is required.",
    );
  }
  let rent: bigint;

  try {
    /**
     * MONEY VALIDATION
     * ----------------
     *
     * Never use parseFloat/default JavaScript arithmetic
     * as the source of truth for money.
     *
     * moneyToCents("3500.50")
     *
     * becomes:
     *
     * 350050n
     *
     * That lets us validate exact centavo values.
     */
    rent =
      moneyToCents(
        defaultRent,
      );
  } catch {
    throw new AppError(
      "Please enter a valid default rent.",
    );
  }

  if (
    rent < 0n
  ) {
    throw new AppError(
      "Default rent cannot be negative.",
    );
  }
  if (
    rent < 0n
  ) {
    throw new AppError(
      "Default rent cannot be negative.",
    );
  }

  const space =
    await prisma.rentableSpace.findFirst({
      where: {
        id:
          rentableSpaceId,

        unitId,

        deletedAt:
          null,

        unit: {
          is: {
            propertyId,

            property: {
              is: {
                landlordAccountId,

                deletedAt:
                  null,
              },
            },
          },
        },
      },

      select: {
        id: true,
      },
    });

  if (!space) {
    throw new AppError(
      "Rentable space not found.",
    );
  }

  /**
   * Important:
   *
   * defaultRent is only the suggested price for NEW leases.
   *
   * Editing defaultRent must NOT modify an existing
   * Lease.monthlyRent.
   *
   * Historical/current lease pricing stays intact.
   */
  await prisma.rentableSpace.update({
    where: {
      id:
        space.id,
    },

    data: {
      name:
        cleanName,

      defaultRent,
    },
  });
}

export async function archiveRentableSpace({
  landlordAccountId,
  propertyId,
  unitId,
  rentableSpaceId,
}: {
  landlordAccountId: string;
  propertyId: string;
  unitId: string;
  rentableSpaceId: string;
}) {
  const space =
    await prisma.rentableSpace.findFirst({
      where: {
        id:
          rentableSpaceId,

        unitId,

        deletedAt:
          null,

        unit: {
          is: {
            propertyId,

            property: {
              is: {
                landlordAccountId,
                deletedAt: null,
              },
            },
          },
        },
      },

      select: {
        id: true,
      },
    });

  if (!space) {
    throw new AppError(
      "Rentable space not found.",
    );
  }

  const activeLease =
    await prisma.lease.findFirst({
      where: {
        rentableSpaceId:
          space.id,

        status:
          "ACTIVE",

        deletedAt:
          null,
      },

      select: {
        id: true,
      },
    });

  if (activeLease) {
    throw new AppError(
      "This space is currently occupied. End its active lease before archiving it.",
    );
  }

  await prisma.rentableSpace.update({
    where: {
      id:
        space.id,
    },

    data: {
      status:
        "INACTIVE",

      deletedAt:
        new Date(),
    },
  });
}