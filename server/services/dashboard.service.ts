import { prisma } from "@/lib/db/prisma";

import {
  getCurrentManilaPeriod,
  getManilaToday,
} from "@/lib/billing-date";

import {
  moneyToCents,
} from "@/lib/money";

/**
 * DashboardService
 * ----------------
 *
 * PURPOSE:
 * Keeps dashboard/business calculations OUT of React components.
 *
 * Why is that useful?
 *
 * UI should mostly do:
 *
 *   get data
 *      ↓
 *   display data
 *
 * Business logic should do:
 *
 *   authorization scope
 *      ↓
 *   database queries
 *      ↓
 *   calculations
 *      ↓
 *   return clean result
 *
 * This separation becomes very useful later if Abang gets:
 *
 * - a mobile app
 * - REST/API endpoints
 * - background jobs
 * - scheduled reports
 *
 * They can reuse the same service instead of copying logic
 * from a React page.
 */

type DashboardInput = {
  landlordAccountId: string;
};

export async function getLandlordDashboard({
  landlordAccountId,
}: DashboardInput) {
  /**
   * SECURITY RULE:
   *
   * `landlordAccountId` must come from our authenticated
   * requireLandlord() helper.
   *
   * It should NEVER come directly from:
   *
   *   searchParams.landlordId
   *   formData.landlordId
   *   request.body.landlordId
   *
   * Otherwise a malicious user could try:
   *
   *   landlordId = somebody else's ID
   *
   * and possibly read their financial data.
   */

  const {
    year,
    month,
  } =
    getCurrentManilaPeriod();

  const today =
    getManilaToday();

  /**
   * We run independent queries at the same time.
   *
   * Promise.all is useful here because these queries do not
   * depend on each other's results.
   *
   * Instead of:
   *
   *   query 1 finishes
   *   then query 2
   *   then query 3
   *
   * we allow PostgreSQL/Prisma to work on them concurrently.
   */
  const [
    properties,
    rentableSpaces,
    charges,
    recentPayments,
  ] = await Promise.all([
    prisma.property.count({
      where: {
        landlordAccountId,
        deletedAt: null,
        isActive: true,
      },
    }),

    prisma.rentableSpace.findMany({
      where: {
        deletedAt: null,

        unit: {
          is: {
            deletedAt: null,

            property: {
              is: {
                landlordAccountId,
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
    }),

    prisma.rentCharge.findMany({
      where: {
        periodYear: year,
        periodMonth: month,

        deletedAt: null,

        status: {
          not: "CANCELLED",
        },

        lease: {
          is: {
            tenant: {
              is: {
                landlordAccountId,
                deletedAt: null,
              },
            },
          },
        },
      },

      include: {
        allocations: {
          where: {
            /**
             * IMPORTANT ACCOUNTING RULE:
             *
             * A voided payment still exists in history,
             * but its money should NOT count as collected.
             */
            payment: {
              voidedAt: null,
            },
          },

          select: {
            amount: true,
          },
        },

        lease: {
          include: {
            tenant: true,

            rentableSpace: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.payment.findMany({
      where: {
        landlordAccountId,

        /**
         * Only valid payments belong in "Recent Payments".
         *
         * Voided payments remain accessible from payment history,
         * but should not appear as successful collection activity.
         */
        voidedAt: null,
      },

      orderBy: {
        paidAt: "desc",
      },

      take: 5,

      include: {
        tenant: true,
      },
    }),
  ]);

  let expected = 0n;
  let collected = 0n;

  const attention: {
    chargeId: string;

    tenantName: string;
    location: string;

    balance: bigint;

    status:
      | "OVERDUE"
      | "PARTIALLY_PAID";
  }[] = [];

  for (const charge of charges) {
    const chargeAmount =
      moneyToCents(
        charge.amount,
      );

    const paid =
      charge.allocations.reduce(
        (
          total,
          allocation,
        ) =>
          total +
          moneyToCents(
            allocation.amount,
          ),

        0n,
      );

    const balance =
      chargeAmount - paid;

    expected +=
      chargeAmount;

    collected +=
      paid;

    /**
     * We calculate overdue from DATE + BALANCE here instead
     * of blindly trusting the stored RentCharge.status.
     *
     * Why?
     *
     * Imagine:
     *
     * Sept 4:
     *   status = UPCOMING
     *
     * Sept 6:
     *   nobody edited the row
     *
     * The database field could still say UPCOMING even though
     * the date has passed.
     *
     * For dashboard display, deriving the truth from:
     *
     *   dueDate
     *   balance
     *
     * is safer.
     */
    const isOverdue =
      balance > 0n &&
      charge.dueDate.getTime() <
        today.getTime();

    const isPartial =
      paid > 0n &&
      balance > 0n;

    if (
      isOverdue ||
      isPartial
    ) {
      attention.push({
        chargeId:
          charge.id,

        tenantName:
          charge.lease.tenant.fullName,

        location: [
          charge.lease
            .rentableSpace
            .unit
            .property
            .name,

          charge.lease
            .rentableSpace
            .unit.name,

          charge.lease
            .rentableSpace
            .name,
        ].join(" · "),

        balance,

        status:
          isOverdue
            ? "OVERDUE"
            : "PARTIALLY_PAID",
      });
    }
  }

  const outstanding =
    expected - collected;

  const totalSpaces =
    rentableSpaces.length;

  const occupiedSpaces =
    rentableSpaces.filter(
      (space) =>
        space.status ===
        "OCCUPIED",
    ).length;

  /**
   * Avoid division by zero when a brand-new landlord
   * has not created any rentable spaces yet.
   */
  const occupancyRate =
    totalSpaces === 0
      ? 0
      : Math.round(
          (
            occupiedSpaces /
            totalSpaces
          ) * 100,
        );

  /**
   * Show the most urgent balances first.
   *
   * V1 rule:
   * highest outstanding amount first.
   */
  attention.sort(
    (a, b) =>
      Number(
        b.balance - a.balance,
      ),
  );

  return {
    period: {
      year,
      month,
    },

    properties,

    totalSpaces,
    occupiedSpaces,
    occupancyRate,

    expected,
    collected,
    outstanding,

    attention:
      attention.slice(
        0,
        5,
      ),

    recentPayments,
  };
}