import Link from "next/link";
import {
  CircleDollarSign,
  ReceiptText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  Pagination,
} from "@/components/ui/pagination";
import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title: "Rent",
};
import {
  PAGE_SIZE,
  getSkip,
  getTotalPages,
  parsePage,
} from "@/lib/pagination";

import {
  getCurrentManilaPeriod,
} from "@/lib/billing-date";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  formatRentPeriod,
  getRentPeriodLabel,
  parseRentPeriod,
  shiftRentPeriod,
} from "@/lib/rent-period";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  formatPHP,
  moneyToCents,
} from "@/lib/money";

import {
  generateRentChargesAction,
} from "./actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubmitButton } from "@/components/forms/submit-button";

type Props = {
  searchParams: Promise<{
    period?: string;
    page?: string;
  }>;
};

export default async function RentPage({
  searchParams,
}: Props) {
  const { landlord } =
    await requireLandlord();

  const params =
    await searchParams;

  const current =
    getCurrentManilaPeriod();

  /**
   * URL example:
   *
   * /rent?period=2026-08
   *
   * If somebody manually enters garbage:
   *
   * /rent?period=banana
   *
   * we safely fall back to the current month.
   */

  const selectedPeriod =
    parseRentPeriod(
      params.period,
    ) ?? current;

  const {
    year,
    month,
  } =
    selectedPeriod;

  const previous =
    shiftRentPeriod(
      selectedPeriod,
      -1,
    );

  const next =
    shiftRentPeriod(
      selectedPeriod,
      1,
    );

  const monthLabel =
    getRentPeriodLabel(
      selectedPeriod,
    );
  /**
   * RENT CHARGE FILTER
   * ------------------
   *
   * This is the single source of truth for:
   *
   * - count()
   * - aggregate()
   * - paginated findMany()
   *
   * Keeping these queries on exactly the same filter is
   * important. Otherwise the table and financial summary
   * could accidentally describe different datasets.
   *
   * SECURITY
   * --------
   *
   * Notice that we don't just filter by month.
   *
   * We follow:
   *
   * RentCharge
   *   -> Lease
   *   -> Tenant
   *   -> landlordAccountId
   *
   * This prevents one landlord from querying another
   * landlord's rent charges.
   */
  const rentChargeWhere = {
    periodYear:
      year,

    periodMonth:
      month,

    deletedAt:
      null,

    status: {
      not:
        "CANCELLED",
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
  } satisfies Prisma.RentChargeWhereInput;
  const requestedPage =
    parsePage(
      params.page,
    );

  const [
    totalRentCharges,
    rentAggregate,
    collectedAggregate,
  ] =
    await Promise.all([
      /**
       * How many rent charges match this month?
       *
       * Used for pagination.
       */
      prisma.rentCharge.count({
        where:
          rentChargeWhere,
      }),

      /**
       * EXPECTED RENT
       * -------------
       *
       * PostgreSQL sums ALL matching rent charges.
       *
       * This is intentionally independent from
       * whichever page the landlord is viewing.
       */
      prisma.rentCharge.aggregate({
        where:
          rentChargeWhere,

        _sum: {
          amount:
            true,
        },
      }),

      /**
       * COLLECTED RENT
       * --------------
       *
       * Rent payments live in allocations.
       *
       * We therefore aggregate valid allocations that belong
       * to rent charges matching this exact month/filter.
       *
       * Voided payments must NOT count as collected money.
       */
      prisma.paymentAllocation.aggregate({
        where: {
          payment: {
            is: {
              voidedAt:
                null,
            },
          },

          rentCharge: {
            is:
              rentChargeWhere,
          },
        },

        _sum: {
          amount:
            true,
        },
      }),
    ]);

  const expected =
    moneyToCents(
      rentAggregate
        ._sum
        .amount ??
      "0",
    );

  const collected =
    moneyToCents(
      collectedAggregate
        ._sum
        .amount ??
      "0",
    );

  const outstanding =
    expected -
    collected;

  const totalPages =
    getTotalPages(
      totalRentCharges,
    );

  const page =
    Math.min(
      requestedPage,
      totalPages,
    );

  const charges =
    await prisma.rentCharge.findMany({
      where:
        rentChargeWhere,

      skip:
        getSkip(page),

      take:
        PAGE_SIZE,

      orderBy: [
        {
          dueDate:
            "asc",
        },

        {
          createdAt:
            "asc",
        },

        /**
         * Stable pagination ordering.
         *
         * If two charges have the exact same dueDate and
         * createdAt, the ID gives PostgreSQL a deterministic
         * final ordering.
         */
        {
          id:
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
            amount:
              true,
          },
        },

        lease: {
          include: {
            tenant:
              true,

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

  type RentChargeRow =
    (typeof charges)[number];

  /**
   * Calculates how much has been paid toward one charge.
   *
   * Important distinction:
   *
   * This helper IS allowed to reduce allocations because
   * we're calculating one individual row.
   *
   * What we must NOT do is reduce paginated rows to calculate
   * the whole month's dashboard totals.
   */
  function getPaidForCharge(
    charge: RentChargeRow,
  ) {
    return charge.allocations.reduce(
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
  function getBalanceForCharge(
    charge: RentChargeRow,
  ) {
    return (
      moneyToCents(
        charge.amount,
      ) -
      getPaidForCharge(
        charge,
      )
    );
  }

  function getStatusTone(
    charge: RentChargeRow,
  ) {
    return charge.status ===
      "OVERDUE"
      ? "red"
      : charge.status ===
        "PARTIALLY_PAID"
        ? "amber"
        : charge.status ===
          "PAID"
          ? "green"
          : "gray";
  }

  function formatDueDate(
    charge: RentChargeRow,
  ) {
    return charge.dueDate.toLocaleDateString(
      "en-PH",
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",

        timeZone:
          "Asia/Manila",
      },
    );
  }

  const rentColumns:
    DataTableColumn<RentChargeRow>[] =
    [
      {
        key:
          "tenant",

        header:
          "Tenant",

        cell: (
          charge,
        ) => (
          <div>
            <p className="font-medium text-zinc-950">
              {
                charge.lease
                  .tenant
                  .fullName
              }
            </p>
          </div>
        ),
      },

      {
        key:
          "space",

        header:
          "Property / Space",

        cell: (
          charge,
        ) => (
          <div className="min-w-[180px]">
            <p className="font-medium text-zinc-800">
              {
                charge.lease
                  .rentableSpace
                  .unit
                  .property
                  .name
              }
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              {
                charge.lease
                  .rentableSpace
                  .unit
                  .name
              }

              {" · "}

              {
                charge.lease
                  .rentableSpace
                  .name
              }
            </p>
          </div>
        ),
      },

      {
        key:
          "due",

        header:
          "Due",

        cell: (
          charge,
        ) => (
          <span className="whitespace-nowrap text-zinc-600">
            {formatDueDate(
              charge,
            )}
          </span>
        ),
      },

      {
        key:
          "rent",

        header:
          "Rent",

        headerClassName:
          "text-right",

        className:
          "text-right",

        cell: (
          charge,
        ) => (
          <span className="whitespace-nowrap font-medium tabular-nums text-zinc-900">
            {formatPHP(
              moneyToCents(
                charge.amount,
              ),
            )}
          </span>
        ),
      },

      {
        key:
          "paid",

        header:
          "Paid",

        headerClassName:
          "text-right",

        className:
          "text-right",

        cell: (
          charge,
        ) => (
          <span className="whitespace-nowrap tabular-nums text-emerald-700">
            {formatPHP(
              getPaidForCharge(
                charge,
              ),
            )}
          </span>
        ),
      },

      {
        key:
          "balance",

        header:
          "Balance",

        headerClassName:
          "text-right",

        className:
          "text-right",

        cell: (
          charge,
        ) => {
          const balance =
            getBalanceForCharge(
              charge,
            );

          return (
            <span
              className={[
                "whitespace-nowrap font-semibold tabular-nums",

                balance > 0n
                  ? "text-red-700"
                  : "text-zinc-500",
              ].join(
                " ",
              )}
            >
              {formatPHP(
                balance,
              )}
            </span>
          );
        },
      },

      {
        key:
          "status",

        header:
          "Status",

        cell: (
          charge,
        ) => (
          <StatusBadge
            tone={getStatusTone(
              charge,
            )}
          >
            {charge.status}
          </StatusBadge>
        ),
      },

      {
        key:
          "action",

        header:
          "",

        className:
          "text-right",

        cell: (
          charge,
        ) => {
          const balance =
            getBalanceForCharge(
              charge,
            );

          if (
            balance <= 0n
          ) {
            return (
              <span className="text-sm text-zinc-400">
                Paid
              </span>
            );
          }

          return (
            <Link
              href={`/payments/new?tenantId=${charge.lease.tenant.id}`}
              className="whitespace-nowrap text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Record payment
            </Link>
          );
        },
      },
    ];
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Rent & Collections
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <Link
              href={`/rent?period=${formatRentPeriod(
                previous,
              )}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50"
              aria-label="Previous month"
            >
              <ChevronLeft
                size={17}
              />
            </Link>

            <div className="min-w-40 text-center">
              <p className="font-medium text-zinc-900">
                {monthLabel}
              </p>
            </div>

            <Link
              href={`/rent?period=${formatRentPeriod(
                next,
              )}`}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50"
              aria-label="Next month"
            >
              <ChevronRight
                size={17}
              />
            </Link>
          </div>
        </div>

        {/*
          NOTE: this is a plain submit action ("generate this
          month's rent charges"), not a search-bar companion
          button, so it uses SubmitButton -- its label stays
          visible at every screen width, unlike SearchButton
          which is deliberately icon-only on mobile.
        */}
        <form
          action={
            generateRentChargesAction
          }
        >
          <input
            type="hidden"
            name="year"
            value={year}
          />

          <input
            type="hidden"
            name="month"
            value={month}
          />

          <SubmitButton
            pendingText="Generating..."
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 sm:w-auto"
          >
            <ReceiptText
              size={17}
            />
            Generate {monthLabel}
          </SubmitButton>
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
            totalRentCharges,
          )}
        />
      </div>

      {charges.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <CircleDollarSign
            size={40}
            className="mx-auto text-zinc-400"
          />

          <h2 className="mt-4 font-semibold text-zinc-950">
            No rent charges for{" "}
            {monthLabel}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Generate this month&apos;s
            charges from your active
            leases.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {/* MOBILE */}
          <div className="space-y-4 lg:hidden">
            {charges.map(
              (charge) => {
                const balance =
                  getBalanceForCharge(
                    charge,
                  );

                return (
                  <article
                    key={
                      charge.id
                    }
                    className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-950">
                          {
                            charge
                              .lease
                              .tenant
                              .fullName
                          }
                        </p>

                        <p className="mt-1 truncate text-sm text-zinc-500">
                          {
                            charge
                              .lease
                              .rentableSpace
                              .unit
                              .property
                              .name
                          }

                          {" · "}

                          {
                            charge
                              .lease
                              .rentableSpace
                              .unit
                              .name
                          }

                          {" · "}

                          {
                            charge
                              .lease
                              .rentableSpace
                              .name
                          }
                        </p>
                      </div>

                      <StatusBadge
                        tone={getStatusTone(
                          charge,
                        )}
                      >
                        {
                          charge.status
                        }
                      </StatusBadge>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4">
                      <div>
                        <p className="text-xs text-zinc-500">
                          Rent
                        </p>

                        <p className="mt-1 font-medium tabular-nums text-zinc-900">
                          {formatPHP(
                            moneyToCents(
                              charge.amount,
                            ),
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Paid
                        </p>

                        <p className="mt-1 tabular-nums text-emerald-700">
                          {formatPHP(
                            getPaidForCharge(
                              charge,
                            ),
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500">
                          Balance
                        </p>

                        <p
                          className={[
                            "mt-1 font-semibold tabular-nums",

                            balance >
                            0n
                              ? "text-red-700"
                              : "text-zinc-500",
                          ].join(
                            " ",
                          )}
                        >
                          {formatPHP(
                            balance,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm">
                      <span className="text-zinc-500">
                        Due{" "}
                        {formatDueDate(
                          charge,
                        )}
                      </span>

                      {balance >
                      0n ? (
                        <Link
                          href={`/payments/new?tenantId=${charge.lease.tenant.id}`}
                          className="font-medium text-emerald-700 hover:text-emerald-800"
                        >
                          Record payment
                        </Link>
                      ) : (
                        <span className="text-zinc-400">
                          Paid
                        </span>
                      )}
                    </div>
                  </article>
                );
              },
            )}
          </div>

          {/* DESKTOP */}
          <div className="hidden lg:block">
            <DataTable
              rows={
                charges
              }
              columns={
                rentColumns
              }
              rowKey={(
                charge,
              ) =>
                charge.id
              }
            />
          </div>

          {/* SHARED PAGINATION */}
          <Pagination
            basePath="/rent"
            page={
              page
            }
            totalPages={
              totalPages
            }
            totalItems={
              totalRentCharges
            }
            pageSize={
              PAGE_SIZE
            }
            query={{
              period:
                formatRentPeriod(
                  selectedPeriod,
                ),
            }}
          />
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