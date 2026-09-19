import {
  randomUUID,
} from "node:crypto";

import {
  CalendarDays,
  CircleDollarSign,
  ReceiptText,
} from "lucide-react";

import {
  getCurrentManilaPeriod,
  getManilaToday,
} from "@/lib/billing-date";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  centsToMoney,
  formatPHP,
  moneyToCents,
} from "@/lib/money";

import {
  generateCurrentRentCharges,
  recordChargePayment,
} from "./actions";

function defaultDateInput() {
  const today =
    getManilaToday();

  return [
    today.getUTCFullYear(),
    String(
      today.getUTCMonth() + 1,
    ).padStart(
      2,
      "0",
    ),
    String(
      today.getUTCDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join("-");
}

export default async function RentPage() {
  const { landlord } =
    await requireLandlord();

  const {
    year,
    month,
  } =
    getCurrentManilaPeriod();

  const charges =
    await prisma.rentCharge.findMany({
      where: {
        periodYear:
          year,

        periodMonth:
          month,

        deletedAt: null,

        status: {
          not: "CANCELLED",
        },

        lease: {
          is: {
            tenant: {
              is: {
                landlordAccountId:
                  landlord.id,
              },
            },
          },
        },
      },

      orderBy: [
        {
          dueDate:
            "asc",
        },

        {
          createdAt:
            "asc",
        },
      ],

      include: {
        allocations: {
          where: {
            payment: {
              voidedAt:
                null,
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
                    property:
                      true,
                  },
                },
              },
            },
          },
        },
      },
    });

  let expected =
    0n;

  let collected =
    0n;

  for (
    const charge of
    charges
  ) {
    expected +=
      moneyToCents(
        charge.amount,
      );

    collected +=
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

  const outstanding =
    expected -
    collected;

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
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Rent & Collections
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            {monthLabel}
          </p>
        </div>

        <form
          action={
            generateCurrentRentCharges
          }
        >
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <ReceiptText
              size={17}
            />

            Generate this month
          </button>
        </form>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric
          label="Expected"
          value={
            formatPHP(
              expected,
            )
          }
        />

        <Metric
          label="Collected"
          value={
            formatPHP(
              collected,
            )
          }
        />

        <Metric
          label="Outstanding"
          value={
            formatPHP(
              outstanding,
            )
          }
        />

        <Metric
          label="Rent charges"
          value={String(
            charges.length,
          )}
        />
      </div>

      {charges.length ===
      0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <CircleDollarSign
            size={40}
            className="mx-auto text-zinc-400"
          />

          <h2 className="mt-4 font-semibold text-zinc-950">
            No rent charges for {monthLabel}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Generate this month's charges from
            your active leases.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {charges.map(
            (charge) => {
              const amount =
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
                amount -
                paid;

              const overdue =
                balance > 0n &&
                charge.dueDate.getTime() <
                  getManilaToday().getTime();

              return (
                <article
                  key={charge.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          status={
                            charge.status
                          }
                        />

                        {overdue &&
                          charge.status ===
                            "PARTIALLY_PAID" && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                              Balance overdue
                            </span>
                          )}
                      </div>

                      <h2 className="mt-3 text-lg font-semibold text-zinc-950">
                        {
                          charge.lease
                            .tenant
                            .fullName
                        }
                      </h2>

                      <p className="mt-1 text-sm text-zinc-500">
                        {
                          charge.lease
                            .rentableSpace
                            .unit
                            .property
                            .name
                        }
                        {" · "}
                        {
                          charge.lease
                            .rentableSpace
                            .unit.name
                        }
                        {" · "}
                        {
                          charge.lease
                            .rentableSpace
                            .name
                        }
                      </p>

                      <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                        <CalendarDays
                          size={15}
                        />

                        Due{" "}
                        {charge.dueDate.toLocaleDateString(
                          "en-PH",
                        )}
                      </div>
                    </div>

                    <div className="grid min-w-72 grid-cols-3 gap-3">
                      <SmallMetric
                        label="Rent"
                        value={
                          formatPHP(
                            amount,
                          )
                        }
                      />

                      <SmallMetric
                        label="Paid"
                        value={
                          formatPHP(
                            paid,
                          )
                        }
                      />

                      <SmallMetric
                        label="Balance"
                        value={
                          formatPHP(
                            balance,
                          )
                        }
                      />
                    </div>
                  </div>

                  {balance >
                    0n && (
                    <details className="mt-5 border-t border-zinc-100 pt-5">
                      <summary className="cursor-pointer text-sm font-medium text-emerald-700">
                        Record payment
                      </summary>

                      <form
                        action={recordChargePayment.bind(
                          null,
                          charge.id,
                        )}
                        className="mt-5 grid gap-4 lg:grid-cols-3"
                      >
                        <input
                          type="hidden"
                          name="idempotencyKey"
                          value={
                            randomUUID()
                          }
                          readOnly
                        />

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Amount received
                          </label>

                          <input
                            name="amount"
                            type="number"
                            min="0.01"
                            max={
                              centsToMoney(
                                balance,
                              )
                            }
                            step="0.01"
                            required
                            defaultValue={
                              centsToMoney(
                                balance,
                              )
                            }
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Payment method
                          </label>

                          <select
                            name="method"
                            defaultValue="CASH"
                            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="CASH">
                              Cash
                            </option>

                            <option value="GCASH">
                              GCash
                            </option>

                            <option value="MAYA">
                              Maya
                            </option>

                            <option value="BANK_TRANSFER">
                              Bank Transfer
                            </option>

                            <option value="OTHER">
                              Other
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Date received
                          </label>

                          <input
                            name="paidAt"
                            type="date"
                            required
                            defaultValue={
                              defaultDateInput()
                            }
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Reference
                          </label>

                          <input
                            name="referenceNumber"
                            placeholder="Optional"
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="mb-2 block text-sm font-medium text-zinc-700">
                            Notes
                          </label>

                          <input
                            name="notes"
                            placeholder="Optional notes"
                            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="lg:col-span-3">
                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                          >
                            Record payment
                          </button>
                        </div>
                      </form>
                    </details>
                  )}
                </article>
              );
            },
          )}
        </div>
      )}
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
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium text-zinc-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function SmallMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    PAID:
      "bg-emerald-50 text-emerald-700",

    PARTIALLY_PAID:
      "bg-amber-50 text-amber-700",

    OVERDUE:
      "bg-red-50 text-red-700",

    DUE:
      "bg-orange-50 text-orange-700",

    UPCOMING:
      "bg-blue-50 text-blue-700",
  };

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status] ??
          "bg-zinc-100 text-zinc-600",
      ].join(" ")}
    >
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}