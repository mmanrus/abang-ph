import { prisma } from "@/lib/db/prisma";

type CreateActiveLeaseInput = {
  landlordAccountId: string;
  tenantId: string;
  rentableSpaceId: string;

  startDate: Date;
  endDate?: Date | null;

  monthlyRent: string;
  securityDeposit?: string | null;

  dueDay: number;

  notes?: string | null;
};

function getTodayInTimeZone(
  timeZone: string,
) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(new Date());

  const year = Number(
    parts.find(
      (part) => part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) => part.type === "month",
    )?.value,
  );

  const day = Number(
    parts.find(
      (part) => part.type === "day",
    )?.value,
  );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );
}

export async function createActiveLease(
  input: CreateActiveLeaseInput,
) {
  if (
    input.dueDay < 1 ||
    input.dueDay > 31
  ) {
    throw new Error(
      "Due day must be between 1 and 31.",
    );
  }

  const monthlyRent =
    Number(input.monthlyRent);

  if (
    !Number.isFinite(monthlyRent) ||
    monthlyRent <= 0
  ) {
    throw new Error(
      "Monthly rent must be greater than zero.",
    );
  }

  if (
    input.securityDeposit &&
    Number(input.securityDeposit) < 0
  ) {
    throw new Error(
      "Security deposit cannot be negative.",
    );
  }

  if (
    input.endDate &&
    input.endDate < input.startDate
  ) {
    throw new Error(
      "Lease end date cannot be before its start date.",
    );
  }

  /*
   * V1 leases represent CURRENT occupancy.
   *
   * Future reservations can be added later with a
   * RESERVED status / reservation workflow.
   */
  const today = getTodayInTimeZone(
    "Asia/Manila",
  );

  if (input.startDate > today) {
    throw new Error(
      "Future-dated leases are not supported yet.",
    );
  }

  if (
    input.endDate &&
    input.endDate < today
  ) {
    throw new Error(
      "A new active lease cannot already be expired.",
    );
  }

  return prisma.$transaction(
    async (tx) => {
      /*
       * Verify that the tenant belongs to
       * this authenticated landlord.
       */
      const tenant =
        await tx.tenant.findFirst({
          where: {
            id: input.tenantId,

            landlordAccountId:
              input.landlordAccountId,

            deletedAt: null,
            isActive: true,
          },

          select: {
            id: true,
          },
        });

      if (!tenant) {
        throw new Error(
          "Tenant not found.",
        );
      }

      /*
       * Verify that the rentable space belongs
       * to one of this landlord's properties.
       */
      const rentableSpace =
        await tx.rentableSpace.findFirst({
          where: {
            id: input.rentableSpaceId,
            deletedAt: null,

            unit: {
              is: {
                deletedAt: null,

                property: {
                  is: {
                    landlordAccountId:
                      input.landlordAccountId,

                    deletedAt: null,
                    isActive: true,
                  },
                },
              },
            },
          },

          select: {
            id: true,
            status: true,
          },
        });

      if (!rentableSpace) {
        throw new Error(
          "Rentable space not found.",
        );
      }

      /*
       * Don't rely only on RentableSpace.status.
       *
       * The lease records are the stronger source
       * for detecting a date conflict.
       */
      const conflictingLease =
        await tx.lease.findFirst({
          where: {
            rentableSpaceId:
              input.rentableSpaceId,

            deletedAt: null,

            status: {
              not: "CANCELLED",
            },

            ...(input.endDate
              ? {
                  startDate: {
                    lte: input.endDate,
                  },
                }
              : {}),

            OR: [
              {
                endDate: null,
              },
              {
                endDate: {
                  gte: input.startDate,
                },
              },
            ],
          },

          select: {
            id: true,
          },
        });

      if (conflictingLease) {
        throw new Error(
          "This space already has an overlapping lease.",
        );
      }

      const lease =
        await tx.lease.create({
          data: {
            tenantId: input.tenantId,

            rentableSpaceId:
              input.rentableSpaceId,

            startDate:
              input.startDate,

            endDate:
              input.endDate ?? null,

            monthlyRent:
              input.monthlyRent,

            securityDeposit:
              input.securityDeposit ||
              null,

            dueDay:
              input.dueDay,

            notes:
              input.notes || null,

            status: "ACTIVE",
          },
        });

      /*
       * Occupancy changes in the same transaction.
       *
       * We don't want:
       *
       * Lease created ✅
       * Space still AVAILABLE ❌
       */
      await tx.rentableSpace.update({
        where: {
          id: input.rentableSpaceId,
        },

        data: {
          status: "OCCUPIED",
        },
      });

      return lease;
    },
  );
}

type EndLeaseInput = {
  landlordAccountId: string;
  leaseId: string;
};

export async function endActiveLease(
  input: EndLeaseInput,
) {
  return prisma.$transaction(
    async (tx) => {
      const lease =
        await tx.lease.findFirst({
          where: {
            id: input.leaseId,

            status: "ACTIVE",

            deletedAt: null,

            tenant: {
              is: {
                landlordAccountId:
                  input.landlordAccountId,

                deletedAt: null,
              },
            },
          },

          select: {
            id: true,
            rentableSpaceId: true,
          },
        });

      if (!lease) {
        throw new Error(
          "Active lease not found.",
        );
      }

      const now = new Date();

      await tx.lease.update({
        where: {
          id: lease.id,
        },

        data: {
          status: "ENDED",
          endedAt: now,
          endDate: now,
        },
      });

      /*
       * Check whether another active lease
       * somehow exists before freeing the space.
       */
      const anotherActiveLease =
        await tx.lease.findFirst({
          where: {
            rentableSpaceId:
              lease.rentableSpaceId,

            id: {
              not: lease.id,
            },

            status: "ACTIVE",
            deletedAt: null,
          },

          select: {
            id: true,
          },
        });

      if (!anotherActiveLease) {
        await tx.rentableSpace.update({
          where: {
            id: lease.rentableSpaceId,
          },

          data: {
            status: "AVAILABLE",
          },
        });
      }
    },
  );
}