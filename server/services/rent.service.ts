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
    throw new Error(
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

  /*
   * Include any non-cancelled lease that overlaps
   * this billing month.
   *
   * That means an ENDED lease can still correctly
   * retain a charge for a month it occupied.
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
    };
  }

  /*
   * Unique:
   *
   * leaseId + year + month
   *
   * makes this operation safe to run more than once.
   */
  await prisma.rentCharge.createMany({
    data,
    skipDuplicates: true,
  });

  return {
    leaseCount:
      leases.length,
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
  const paymentAmount =
    moneyToCents(
      input.amount,
    );

  if (
    paymentAmount <= 0n
  ) {
    throw new Error(
      "Payment must be greater than zero.",
    );
  }

  if (
    input.allocations.length ===
    0
  ) {
    throw new Error(
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
    throw new Error(
      "Payment amount must equal the allocation total.",
    );
  }

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
          throw new Error(
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
        throw new Error(
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

      if (
        charges.length !==
        new Set(
          chargeIds,
        ).size
      ) {
        throw new Error(
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
          throw new Error(
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
          throw new Error(
            "Allocation must be greater than zero.",
          );
        }

        if (
          allocationAmount >
          remaining
        ) {
          throw new Error(
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