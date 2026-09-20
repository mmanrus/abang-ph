import {
  prisma,
} from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";
import {
  moneyToCents,
} from "@/lib/money";
import {
  syncRentChargeStatus,
} from "@/server/services/rent.service";

/**
 * PaymentService
 * --------------
 *
 * Financial records should be handled differently from
 * ordinary CRUD records.
 *
 * For example:
 *
 * Property name typo:
 *
 *   UPDATE property
 *
 * Fine.
 *
 * A payment:
 *
 *   DELETE payment
 *
 * Dangerous.
 *
 * Why?
 *
 * Money records are part of the business history.
 *
 * Instead of deleting a payment, Abang marks it as:
 *
 *   voidedAt
 *   voidReason
 *
 * The original record remains available for:
 *
 * - auditing
 * - debugging
 * - landlord history
 * - dispute investigation
 */

type VoidPaymentInput = {
  landlordAccountId: string;

  paymentId: string;

  reason: string;
};

export async function voidPayment({
  landlordAccountId,
  paymentId,
  reason,
}: VoidPaymentInput) {
  const cleanReason =
    reason.trim();

  if (
    cleanReason.length < 3
  ) {
    throw new AppError(
      "Please provide a reason for voiding this payment.",
    );
  }

  /**
   * TRANSACTION:
   *
   * These operations belong together:
   *
   * 1. verify payment ownership
   * 2. mark payment void
   * 3. recalculate affected rent charge(s)
   *
   * We don't want a situation like:
   *
   * Payment VOIDED ✅
   * Rent charge still PAID ❌
   *
   * If one operation fails, Prisma rolls everything back.
   */
  return prisma.$transaction(
    async (tx) => {
      /**
       * SECURITY:
       *
       * We don't use:
       *
       * tx.payment.findUnique({ id: paymentId })
       *
       * by itself.
       *
       * Why?
       *
       * paymentId can come from the URL/browser.
       *
       * A malicious user could theoretically submit another
       * landlord's payment ID.
       *
       * We therefore require BOTH:
       *
       * payment.id
       * landlordAccountId
       */
      const payment =
        await tx.payment.findFirst({
          where: {
            id: paymentId,

            landlordAccountId,

            voidedAt: null,
          },

          include: {
            allocations: {
              select: {
                rentChargeId: true,
              },
            },
          },
        });

      if (!payment) {
        throw new AppError(
          "Active payment not found.",
        );
      }

      await tx.payment.update({
        where: {
          id:
            payment.id,
        },

        data: {
          voidedAt:
            new Date(),

          voidReason:
            cleanReason,
        },
      });

      /**
       * PaymentAllocation rows are NOT deleted.
       *
       * That's intentional.
       *
       * They remain as historical evidence of what this payment
       * originally paid.
       *
       * Our financial calculations ignore allocations whose
       * parent payment has:
       *
       *   voidedAt != null
       */

      for (
        const allocation of
        payment.allocations
      ) {
        /**
         * Example:
         *
         * Before void:
         *
         * Rent ₱3,000
         * Payment ₱3,000
         * Status PAID
         *
         * After void:
         *
         * Rent ₱3,000
         * Valid payment ₱0
         *
         * syncRentChargeStatus() recalculates:
         *
         * PAID → OVERDUE / DUE / UPCOMING
         */
        await syncRentChargeStatus(
          tx,
          allocation.rentChargeId,
        );
      }
    },
  );
}


/**
 * Loads all unpaid rent charges for ONE tenant.
 *
 * SECURITY
 * --------
 * tenantId alone is NOT enough authorization.
 *
 * tenantId comes from the browser/URL, so a malicious user
 * could theoretically change it to another tenant's ID.
 *
 * Therefore the query always requires BOTH:
 *
 *   tenant.id = requested tenant
 *   tenant.landlordAccountId = authenticated landlord
 *
 * This is called tenant/data isolation.
 */
export async function getOutstandingChargesForTenant({
  landlordAccountId,
  tenantId,
}: {
  landlordAccountId: string;
  tenantId: string;
}) {
  const tenant =
    await prisma.tenant.findFirst({
      where: {
        id: tenantId,

        landlordAccountId,

        deletedAt: null,
      },

      select: {
        id: true,
        fullName: true,
      },
    });

  if (!tenant) {
    throw new AppError(
      "Tenant not found.",
    );
  }

  const charges =
    await prisma.rentCharge.findMany({
      where: {
        deletedAt: null,

        status: {
          not: "CANCELLED",
        },

        lease: {
          is: {
            tenantId,

            tenant: {
              is: {
                landlordAccountId,
                deletedAt: null,
              },
            },
          },
        },
      },

      orderBy: [
        {
          periodYear: "asc",
        },
        {
          periodMonth: "asc",
        },
      ],

      include: {
        allocations: {
          /**
           * A voided payment should not count toward the
           * amount already paid.
           */
          where: {
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
    });

  /**
   * Don't trust RentCharge.status alone to tell us whether
   * there is money remaining.
   *
   * Financial truth comes from:
   *
   * charge amount
   * -
   * valid payment allocations
   */
  const outstanding =
    charges.flatMap(
      (charge) => {
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

        if (balance <= 0n) {
          return [];
        }

        return [
          {
            id: charge.id,

            periodYear:
              charge.periodYear,

            periodMonth:
              charge.periodMonth,

            dueDate:
              charge.dueDate,

            amount:
              chargeAmount,

            paid,

            balance,

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
          },
        ];
      },
    );

  return {
    tenant,
    charges: outstanding,
  };
}