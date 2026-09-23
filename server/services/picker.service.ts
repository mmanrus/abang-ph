import "server-only";

import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  PICKER_PAGE_SIZE,
  type PickerResult,
} from "@/lib/picker";

import {
  getSkip,
  getTotalPages,
} from "@/lib/pagination";

/**
 * PickerService
 * -------------
 *
 * Provides small, paginated datasets for entity-selection
 * modals.
 *
 * IMPORTANT:
 *
 * We never load every property or tenant and then search in
 * React.
 *
 * Search + pagination happens in PostgreSQL.
 */

function normalizePage(
  page: number,
) {
  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

function normalizeSearch(
  value: string,
) {
  /**
   * Limit search input length before sending it into
   * database queries.
   *
   * This is mostly defensive input hygiene.
   */
  return value
    .trim()
    .slice(
      0,
      100,
    );
}

export async function searchPropertyPicker({
  landlordAccountId,
  q,
  page,
}: {
  landlordAccountId:
    string;

  q: string;

  page: number;
}): Promise<PickerResult> {
  const search =
    normalizeSearch(q);

  const requestedPage =
    normalizePage(page);

  const where = {
    /**
     * DATA ISOLATION:
     *
     * The picker can only return properties belonging to
     * the authenticated landlord.
     */
    landlordAccountId,

    deletedAt:
      null,

    isActive:
      true,

    ...(search
      ? {
          OR: [
            {
              name: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              addressLine1: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              barangay: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              city: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              province: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.PropertyWhereInput;

  const totalItems =
    await prisma.property.count({
      where,
    });

  const totalPages =
    getTotalPages(
      totalItems,
      PICKER_PAGE_SIZE,
    );

  const safePage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const properties =
    await prisma.property.findMany({
      where,

      skip:
        getSkip(
          safePage,
          PICKER_PAGE_SIZE,
        ),

      take:
        PICKER_PAGE_SIZE,

      orderBy: [
        {
          name:
            "asc",
        },

        {
          id:
            "asc",
        },
      ],

      select: {
        id: true,
        name: true,

        barangay:
          true,

        city:
          true,

        province:
          true,

        units: {
          where: {
            deletedAt:
              null,
          },

          select: {
            rentableSpaces: {
              where: {
                deletedAt:
                  null,
              },

              select: {
                status:
                  true,
              },
            },
          },
        },
      },
    });

  return {
    page:
      safePage,

    totalPages,

    totalItems,

    items:
      properties.map(
        (property) => {
          let spaces = 0;
          let occupied = 0;

          for (
            const unit of
            property.units
          ) {
            spaces +=
              unit.rentableSpaces.length;

            occupied +=
              unit.rentableSpaces.filter(
                (space) =>
                  space.status ===
                  "OCCUPIED",
              ).length;
          }

          /**
           * AVAILABILITY BADGE
           * -------------------
           *
           * "Available" here means (total spaces - occupied
           * spaces). This is what SpacePickerField's property
           * step uses to render "N Available" / "Fully
           * Occupied" on each property card.
           */
          const available =
            spaces - occupied;

          const badge =
            available > 0
              ? `${available} Available`
              : "Fully Occupied";

          const location = [
            property.barangay,
            property.city,
            property.province,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            id:
              property.id,

            title:
              property.name,

            subtitle:
              location ||
              "No location provided",

            details: [
              `${property.units.length} ${
                property.units.length === 1
                  ? "room"
                  : "rooms"
              }`,

              `${spaces} ${
                spaces === 1
                  ? "space"
                  : "spaces"
              }`,

              `${occupied} occupied`,
            ],

            badge,
          };
        },
      ),
  };
}

export async function searchTenantPicker({
  landlordAccountId,
  q,
  page,
}: {
  landlordAccountId:
    string;

  q: string;

  page: number;
}): Promise<PickerResult> {
  const search =
    normalizeSearch(q);

  const requestedPage =
    normalizePage(page);

  const where = {
    landlordAccountId,

    deletedAt:
      null,

    ...(search
      ? {
          OR: [
            {
              fullName: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              phone: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              email: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.TenantWhereInput;

  const totalItems =
    await prisma.tenant.count({
      where,
    });

  const totalPages =
    getTotalPages(
      totalItems,
      PICKER_PAGE_SIZE,
    );

  const safePage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const tenants =
    await prisma.tenant.findMany({
      where,

      skip:
        getSkip(
          safePage,
          PICKER_PAGE_SIZE,
        ),

      take:
        PICKER_PAGE_SIZE,

      orderBy: [
        {
          isActive:
            "desc",
        },

        {
          fullName:
            "asc",
        },

        {
          id:
            "asc",
        },
      ],

      select: {
        id: true,

        fullName:
          true,

        phone: true,
        email: true,

        isActive:
          true,

        leases: {
          where: {
            status:
              "ACTIVE",

            deletedAt:
              null,
          },

          take: 1,

          select: {
            rentableSpace: {
              select: {
                name: true,

                unit: {
                  select: {
                    name:
                      true,

                    property: {
                      select: {
                        name:
                          true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

  return {
    page:
      safePage,

    totalPages,

    totalItems,

    items:
      tenants.map(
        (tenant) => {
          const lease =
            tenant.leases[0];

          const leaseDescription =
            lease
              ? [
                  lease
                    .rentableSpace
                    .unit
                    .property
                    .name,

                  lease
                    .rentableSpace
                    .unit
                    .name,

                  lease
                    .rentableSpace
                    .name,
                ].join(
                  " · ",
                )
              : "No active lease";

          return {
            id:
              tenant.id,

            title:
              tenant.fullName,

            subtitle:
              tenant.phone ||
              tenant.email ||
              "No contact information",

            details: [
              leaseDescription,
            ],

            badge:
              tenant.isActive
                ? "ACTIVE"
                : "INACTIVE",
          };
        },
      ),
  };
}

/**
 * ============================================================
 * RENTABLE SPACE PICKER
 * ============================================================
 *
 * Step 2 of the lease-creation flow: once a property has been
 * chosen (searchPropertyPicker above), this returns that
 * property's AVAILABLE rentable spaces only -- occupied and
 * inactive spaces are deliberately excluded here, since this
 * picker exists specifically to assign a NEW lease to a space
 * nobody is currently renting.
 *
 * This intentionally does NOT reuse the generic PickerResult /
 * PickerOption shape from "@/lib/picker", because each result
 * needs to carry `defaultRent` so the lease form can prefill
 * "Monthly rent" the moment a space is chosen -- that's not
 * part of the generic picker shape used by property/tenant.
 */

export type RentableSpacePickerItem = {
  id: string;
  title: string;
  subtitle: string;
  details: string[];
  defaultRent: string | null;
};

export type RentableSpacePickerResult = {
  page: number;
  totalPages: number;
  totalItems: number;
  items: RentableSpacePickerItem[];
};

export async function searchRentableSpacePicker({
  landlordAccountId,
  propertyId,
  q,
  page,
}: {
  landlordAccountId:
    string;

  propertyId:
    string;

  q: string;

  page: number;
}): Promise<RentableSpacePickerResult> {
  const search =
    normalizeSearch(q);

  const requestedPage =
    normalizePage(page);

  const EMPTY: RentableSpacePickerResult = {
    page: 1,
    totalPages: 1,
    totalItems: 0,
    items: [],
  };

  /**
   * DATA ISOLATION:
   *
   * Confirm the property actually belongs to this landlord
   * BEFORE returning any of its spaces. Without this check,
   * a landlord could pass an arbitrary propertyId and read
   * another landlord's rentable spaces.
   */
  const property =
    await prisma.property.findFirst({
      where: {
        id:
          propertyId,

        landlordAccountId,

        deletedAt:
          null,
      },

      select: {
        id: true,
      },
    });

  if (!property) {
    return EMPTY;
  }

  const where = {
    status:
      "AVAILABLE",

    deletedAt:
      null,

    unit: {
      propertyId,

      deletedAt:
        null,
    },

    ...(search
      ? {
          OR: [
            {
              name: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              unit: {
                name: {
                  contains:
                    search,

                  mode:
                    "insensitive",
                },
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.RentableSpaceWhereInput;

  const totalItems =
    await prisma.rentableSpace.count({
      where,
    });

  const totalPages =
    getTotalPages(
      totalItems,
      PICKER_PAGE_SIZE,
    );

  const safePage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const spaces =
    await prisma.rentableSpace.findMany({
      where,

      skip:
        getSkip(
          safePage,
          PICKER_PAGE_SIZE,
        ),

      take:
        PICKER_PAGE_SIZE,

      orderBy: [
        {
          unit: {
            name:
              "asc",
          },
        },

        {
          name:
            "asc",
        },

        {
          id:
            "asc",
        },
      ],

      select: {
        id: true,
        name: true,

        defaultRent:
          true,

        unit: {
          select: {
            name:
              true,
          },
        },
      },
    });

  return {
    page:
      safePage,

    totalPages,

    totalItems,

    items:
      spaces.map(
        (space) => ({
          id:
            space.id,

          title:
            space.name,

          subtitle:
            space.unit.name,

          details: [],

          defaultRent:
            space.defaultRent
              ? space.defaultRent.toString()
              : null,
        }),
      ),
  };
}