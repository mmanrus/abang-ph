import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  getCurrentManilaPeriod,
} from "@/lib/billing-date";

import {
  formatPHP,
} from "@/lib/money";

import {
  getMonthlyFinancialReport,
} from "@/server/services/report.service";

export default async function ReportsPage() {
  const { landlord } =
    await requireLandlord();

  const {
    year,
    month,
  } =
    getCurrentManilaPeriod();

  const report =
    await getMonthlyFinancialReport({
      landlordAccountId:
        landlord.id,

      year,
      month,
    });

  const monthLabel =
    new Intl.DateTimeFormat(
      "en-PH",
      {
        month: "long",
        year: "numeric",

        timeZone:
          "Asia/Manila",
      },
    ).format(
      new Date(
        Date.UTC(
          year,
          month - 1,
          1,
        ),
      ),
    );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Reports
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Financial overview for{" "}
          {monthLabel}.
        </p>
      </div>

      <h2 className="mt-8 font-semibold text-zinc-950">
        Rent performance
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Expected rent"
          value={formatPHP(
            report.expectedRent,
          )}
        />

        <Metric
          label="Rent applied"
          value={formatPHP(
            report.rentApplied,
          )}
        />

        <Metric
          label="Outstanding"
          value={formatPHP(
            report.outstandingRent,
          )}
        />
      </div>

      <h2 className="mt-8 font-semibold text-zinc-950">
        Cash flow
      </h2>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Metric
          label="Cash received"
          value={formatPHP(
            report.cashReceived,
          )}
        />

        <Metric
          label="Expenses"
          value={formatPHP(
            report.expenseTotal,
          )}
        />

        <Metric
          label="Net cash flow"
          value={formatPHP(
            report.netCashFlow,
          )}
        />
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-zinc-950">
            Expenses by category
          </h2>
        </div>

        {report.expenseByCategory
          .length === 0 ? (
          <div className="px-6 py-10 text-sm text-zinc-500">
            No expenses recorded.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {report.expenseByCategory.map(
              (item) => (
                <div
                  key={
                    item.category
                  }
                  className="flex items-center justify-between px-5 py-4 sm:px-6"
                >
                  <p className="font-medium text-zinc-800">
                    {item.category.replaceAll(
                      "_",
                      " ",
                    )}
                  </p>

                  <p className="font-semibold text-zinc-950">
                    {formatPHP(
                      item.amount,
                    )}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  );
}