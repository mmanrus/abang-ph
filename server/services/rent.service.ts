import {
  Prisma,
} from "@/generated/prisma/client";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  centsToMoney,
  moneyToCents,
} from "@/lib/money";

import {
  getManilaToday,
  getPeriodEnd,
  getPeriodStart,
  getRentDueDate,
} from "@/lib/billing-date";
import { AppError } from "@/lib/errors";

type ChargeStatus =
  | "UPCOMING"
  | "DUE"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

function deriveChargeStatus({
  amount,
  paid,
  dueDate,
}: {
  amount: bigint;
  paid: bigint;
  dueDate: Date;
}): ChargeStatus {
  if (paid >= amount) {
    return "PAID";
  }

  /*
   * Partial payment stays PARTIALLY_PAID.
   *
   * The UI can additionally indicate whether the
   * remaining balance is already overdue.
   */
  if (paid > 0n) {
    return "PARTIALLY_PAID";
  }

  const today =
    getManilaToday();

  if (
    dueDate.getTime() <
    today.getTime()
  ) {
    return "OVERDUE";
  }

  if (
    dueDate.getTime() ===
    today.getTime()
  ) {
    return "DUE";
  }

  return "UPCOMING";
}

async function getPaidAmount(
  tx: Prisma.TransactionClient,
  rentChargeId: string,
) {
  const allocations =
    await tx.paymentAllocation.findMany({
      where: {
        rentChargeId,

        payment: {
          voidedAt: null,
        },
      },

      select: {
        amount: true,
      },
    });

  return allocations.reduce(
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
}

export async function syncRentChargeStatus(
  tx: Prisma.TransactionClient,
  rentChargeId: string,
) {
  const charge =
    await tx.rentCharge.findUnique({
      where: {
        id: rentChargeId,
      },

      select: {
        amount: true,
        dueDate: true,
        status: true,
      },
    });

  if (!charge) {
    throw new AppError(
      "Rent charge not found.",
    );
  }

  if (
    charge.status ===
    "CANCELLED"
  ) {
    return;
  }

  const amount =
    moneyToCents(
      charge.amount,
    );

  const paid =
    await getPaidAmount(
      tx,
      rentChargeId,
    );

  const status =
    deriveChargeStatus({
      amount,
      paid,
      dueDate:
        charge.dueDate,
    });

  if (
    charge.status !==
    status
  ) {
    await tx.rentCharge.update({
      where: {
        id: rentChargeId,
      },

      data: {
        status,
      },
    });
  }
}

type GenerateRentChargesInput = {
  landlordAccountId: string;
  year: number;
  month: number;
};
export async function generateRentChargesForPeriod({
  landlordAccountId,
  year,
  month,
}: GenerateRentChargesInput) {
  /**
   * INPUT VALIDATION
   * ----------------
   *
   * `year` and `month` may eventually come from:
   *
   * - URL parameters
   * - a server action
   * - an admin tool
   * - a scheduled job
   *
   * Services should protect themselves instead of assuming
   * every caller validated correctly.
   */
  if (
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2200
  ) {
    throw new AppError(
      "Invalid rent year.",
    );
  }

  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new AppError(
      "Invalid rent month.",
    );
  }

  const periodStart =
    getPeriodStart(
      year,
      month,
    );

  const periodEnd =
    getPeriodEnd(
      year,
      month,
    );

  /**
   * LEASE LIFECYCLE RULE
   * --------------------
   *
   * A lease receives a charge for this period when:
   *
   *   lease started on/before end of month
   *
   * AND
   *
   *   lease has no end date
   *   OR
   *   lease ended on/after beginning of month
   *
   * Example:
   *
   * Lease:
   *   Aug 20 → Sep 10
   *
   * overlaps:
   *   August    ✅
   *   September ✅
   *   October   ❌
   *
   * V1 BILLING POLICY:
   * We currently charge the full monthlyRent for any month
   * the lease overlaps.
   *
   * We are NOT doing prorated rent yet.
   *
   * If we later support proration, this is the service where
   * that business rule belongs—not inside React.
   */
  const leases =
    await prisma.lease.findMany({
      where: {
        deletedAt: null,

        status: {
          not: "CANCELLED",
        },

        startDate: {
          lte: periodEnd,
        },

        OR: [
          {
            endDate: null,
          },

          {
            endDate: {
              gte: periodStart,
            },
          },
        ],

        /**
         * DATA ISOLATION
         * --------------
         *
         * Only leases belonging to tenants owned by the
         * authenticated landlord are eligible.
         */
        tenant: {
          is: {
            landlordAccountId,
            deletedAt: null,
          },
        },
      },

      select: {
        id: true,
        monthlyRent: true,
        dueDay: true,
      },
    });

  const today =
    getManilaToday();

  const data =
    leases.map(
      (lease) => {
        const dueDate =
          getRentDueDate(
            year,
            month,
            lease.dueDay,
          );

        let status:
          | "UPCOMING"
          | "DUE"
          | "OVERDUE";

        if (
          dueDate.getTime() <
          today.getTime()
        ) {
          status =
            "OVERDUE";
        } else if (
          dueDate.getTime() ===
          today.getTime()
        ) {
          status =
            "DUE";
        } else {
          status =
            "UPCOMING";
        }

        return {
          leaseId:
            lease.id,

          periodYear:
            year,

          periodMonth:
            month,

          amount:
            lease.monthlyRent,

          dueDate,

          status,
        };
      },
    );

  if (
    data.length === 0
  ) {
    return {
      leaseCount: 0,
      generatedCount: 0,
    };
  }

  /**
   * IDEMPOTENCY AT THE DATABASE LEVEL
   * ---------------------------------
   *
   * RentCharge has:
   *
   * @@unique([
   *   leaseId,
   *   periodYear,
   *   periodMonth
   * ])
   *
   * and createMany uses:
   *
   * skipDuplicates: true
   *
   * Therefore this function can safely be called twice:
   *
   * Generate September
   * Generate September again
   *
   * and we still get only ONE September charge per lease.
   *
   * This is exactly what makes this service suitable for a
   * future scheduled job.
   */
  const result =
    await prisma.rentCharge.createMany({
      data,

      skipDuplicates:
        true,
    });

  return {
    leaseCount:
      leases.length,

    generatedCount:
      result.count,
  };
}

type PaymentMethod =
  | "CASH"
  | "GCASH"
  | "MAYA"
  | "BANK_TRANSFER"
  | "OTHER";

type RecordPaymentInput = {
  landlordAccountId: string;

  tenantId: string;

  amount: string;

  method: PaymentMethod;

  paidAt: Date;

  referenceNumber?: string | null;
  notes?: string | null;

  idempotencyKey: string;

  allocations: {
    rentChargeId: string;
    amount: string;
  }[];
};

export async function recordRentPayment(
  input: RecordPaymentInput,
) {
  /*
  * Build the list of RentCharge IDs once.
  *
  * We reuse this list later when:
  *
  * - loading charges
  * - validating ownership
  * - synchronizing charge statuses
  */
  const chargeIds =
    input.allocations.map(
      (allocation) =>
        allocation.rentChargeId,
    );

  /*
   * SECURITY / DATA INTEGRITY:
   *
   * One Payment should only contain ONE allocation
   * per RentCharge.
   *
   * Without this check, a crafted HTTP request could send:
   *
   *   Charge A → ₱2,000
   *   Charge A → ₱2,000
   *
   * even though our React UI would never intentionally
   * create that request.
   */
  if (
    new Set(chargeIds).size !==
    chargeIds.length
  ) {
    throw new AppError(
      "The same rent charge cannot be allocated twice in one payment.",
    );
  }
  const paymentAmount =
    moneyToCents(
      input.amount,
    );

  if (
    paymentAmount <= 0n
  ) {
    throw new AppError(
      "Payment must be greater than zero.",
    );
  }

  if (
    input.allocations.length ===
    0
  ) {
    throw new AppError(
      "Payment requires at least one allocation.",
    );
  }

  const allocationTotal =
    input.allocations.reduce(
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

  if (
    allocationTotal !==
    paymentAmount
  ) {
    throw new AppError(
      "Payment amount must equal the allocation total.",
    );
  }
  /**
   * Records a rent payment.
   *
   * DATA INTEGRITY:
   * A payment may affect several records:
   *
   *   Payment
   *      ↓
   * PaymentAllocation
   *      ↓
   * RentCharge status
   *
   * These changes belong to ONE business operation.
   *
   * A database transaction ensures either:
   *
   *   ALL changes succeed
   *
   * or
   *
   *   NONE of them are committed.
   *
   * Without this, a crash halfway through could record the money but
   * fail to update the rent charge, leaving inconsistent financial data.
   */
  return prisma.$transaction(
    async (tx) => {
      /*
       * Idempotency protection.
       *
       * If the browser retries the exact same form,
       * don't create the payment twice.
       */
      const existingPayment =
        await tx.payment.findUnique({
          where: {
            idempotencyKey:
              input.idempotencyKey,
          },
        });

      if (
        existingPayment
      ) {
        if (
          existingPayment.landlordAccountId !==
          input.landlordAccountId
        ) {
          throw new AppError(
            "Invalid payment request.",
          );
        }

        return existingPayment;
      }

      const tenant =
        await tx.tenant.findFirst({
          where: {
            id: input.tenantId,

            landlordAccountId:
              input.landlordAccountId,

            deletedAt: null,
          },

          select: {
            id: true,
          },
        });

      if (!tenant) {
        throw new AppError(
          "Tenant not found.",
        );
      }

      const chargeIds =
        input.allocations.map(
          (allocation) =>
            allocation.rentChargeId,
        );

      const charges =
        await tx.rentCharge.findMany({
          where: {
            id: {
              in: chargeIds,
            },

            deletedAt: null,

            status: {
              not:
                "CANCELLED",
            },

            lease: {
              is: {
                tenantId:
                  input.tenantId,

                tenant: {
                  is: {
                    landlordAccountId:
                      input.landlordAccountId,
                  },
                },
              },
            },
          },

          select: {
            id: true,
            amount: true,
          },
        });
      /*
      * Because chargeIds is already guaranteed unique,
      * the number of database rows returned must exactly
      * match the number requested.
      *
      * If it does not, then at least one charge:
      *
      * - does not exist
      * - belongs to another landlord
      * - belongs to another tenant
      * - was deleted
      * - or was cancelled
      */
      if (
        charges.length !==
        new Set(
          chargeIds,
        ).size
      ) {
        throw new AppError(
          "One or more rent charges are invalid.",
        );
      }

      /*
       * Prevent overpayment of any individual
       * RentCharge.
       */
      for (
        const allocation of
        input.allocations
      ) {
        const charge =
          charges.find(
            (item) =>
              item.id ===
              allocation.rentChargeId,
          );

        if (!charge) {
          throw new AppError(
            "Rent charge not found.",
          );
        }

        const amount =
          moneyToCents(
            charge.amount,
          );

        const paid =
          await getPaidAmount(
            tx,
            charge.id,
          );

        const remaining =
          amount - paid;

        const allocationAmount =
          moneyToCents(
            allocation.amount,
          );

        if (
          allocationAmount <=
          0n
        ) {
          throw new AppError(
            "Allocation must be greater than zero.",
          );
        }

        if (
          allocationAmount >
          remaining
        ) {
          throw new AppError(
            `Payment exceeds remaining balance of ₱${centsToMoney(
              remaining,
            )}.`,
          );
        }
      }

      const payment =
        await tx.payment.create({
          data: {
            landlordAccountId:
              input.landlordAccountId,

            tenantId:
              input.tenantId,

            amount:
              input.amount,

            method:
              input.method,

            paidAt:
              input.paidAt,

            referenceNumber:
              input.referenceNumber ||
              null,

            notes:
              input.notes ||
              null,

            idempotencyKey:
              input.idempotencyKey,

            allocations: {
              create:
                input.allocations.map(
                  (
                    allocation,
                  ) => ({
                    rentChargeId:
                      allocation.rentChargeId,

                    amount:
                      allocation.amount,
                  }),
                ),
            },
          },
        });

      for (
        const chargeId of
        chargeIds
      ) {
        await syncRentChargeStatus(
          tx,
          chargeId,
        );
      }

      return payment;
    },
  );
}