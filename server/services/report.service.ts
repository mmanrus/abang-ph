import "server-only";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  getPeriodStart,
} from "@/lib/billing-date";

import {
  moneyToCents,
} from "@/lib/money";

/**
 * FinancialReportService
 * ----------------------
 *
 * We intentionally calculate TWO different concepts:
 *
 * RENT PERFORMANCE
 *
 *   expected rent
 *   rent applied
 *   outstanding
 *
 * versus:
 *
 * CASH FLOW
 *
 *   actual payments received during month
 *   actual expenses paid during month
 *   net cash flow
 *
 * These are NOT always the same.
 *
 * Example:
 *
 * September rent gets paid in October.
 *
 * September rent report:
 *   Expected = ₱5,000
 *
 * October cash flow:
 *   Cash received = ₱5,000
 *
 * Keeping these ideas separate gives the landlord
 * much more accurate financial information.
 */

export async function getMonthlyFinancialReport({
  landlordAccountId,
  year,
  month,
}: {
  landlordAccountId: string;
  year: number;
  month: number;
}) {
  const start =
    getPeriodStart(
      year,
      month,
    );

  const nextMonth =
    getPeriodStart(
      year,
      month + 1,
    );

  const [
    charges,
    payments,
    expenses,
  ] =
    await Promise.all([
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
                },
              },
            },
          },
        },

        include: {
          allocations: {
            where: {
              payment: {
                voidedAt: null,
              },
            },

            select: {
              amount: true,
            },
          },
        },
      }),

      /**
       * CASH RECEIVED:
       *
       * Based on payment.paidAt,
       * NOT the rent period being paid.
       */
      prisma.payment.findMany({
        where: {
          landlordAccountId,

          voidedAt: null,

          paidAt: {
            gte: start,
            lt: nextMonth,
          },
        },

        select: {
          amount: true,
        },
      }),

      prisma.expense.findMany({
        where: {
          landlordAccountId,

          deletedAt: null,

          expenseDate: {
            gte: start,
            lt: nextMonth,
          },
        },

        select: {
          amount: true,
          category: true,
        },
      }),
    ]);

  let expectedRent = 0n;
  let rentApplied = 0n;

  for (const charge of charges) {
    expectedRent +=
      moneyToCents(
        charge.amount,
      );

    rentApplied +=
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
  }

  const outstandingRent =
    expectedRent -
    rentApplied;

  const cashReceived =
    payments.reduce(
      (
        total,
        payment,
      ) =>
        total +
        moneyToCents(
          payment.amount,
        ),

      0n,
    );

  const expenseTotal =
    expenses.reduce(
      (
        total,
        expense,
      ) =>
        total +
        moneyToCents(
          expense.amount,
        ),

      0n,
    );

  const netCashFlow =
    cashReceived -
    expenseTotal;

  /**
   * Grouping by category belongs in the service,
   * not inside the React page.
   *
   * The UI should receive data that is already
   * ready to display.
   */
  const expenseByCategory =
    new Map<
      string,
      bigint
    >();

  for (const expense of expenses) {
    const current =
      expenseByCategory.get(
        expense.category,
      ) ?? 0n;

    expenseByCategory.set(
      expense.category,

      current +
        moneyToCents(
          expense.amount,
        ),
    );
  }

  return {
    expectedRent,
    rentApplied,
    outstandingRent,

    cashReceived,
    expenseTotal,
    netCashFlow,

    expenseByCategory:
      Array.from(
        expenseByCategory.entries(),
      )
        .map(
          ([
            category,
            amount,
          ]) => ({
            category,
            amount,
          }),
        )
        .sort(
          (a, b) =>
            Number(
              b.amount -
                a.amount,
            ),
        ),
  };
}