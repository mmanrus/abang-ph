import Link from "next/link";

import {
  ChevronRight,
  CreditCard,
  Plus,
  Search,
  X,
} from "lucide-react";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  formatPHP,
  moneyToCents,
} from "@/lib/money";

import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  PAGE_SIZE,
  getSkip,
  getTotalPages,
  parsePage,
} from "@/lib/pagination";
import { Pagination } from "@/components/ui/pagination";
import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title: "Payments",
};
type Props = {
  searchParams: Promise<{
    q?: string;
    method?: string;
    status?: string;
    page?: string;
  }>;
};

/**
 * PAYMENT METHOD FILTER
 * ---------------------
 *
 * We whitelist values instead of trusting whatever
 * comes from the URL.
 *
 * Good:
 *
 *   GCASH
 *   CASH
 *
 * Invalid:
 *
 *   HACKERMAN
 *
 * Invalid values simply fall back to "all".
 */
const paymentMethods = [
  "CASH",
  "GCASH",
  "MAYA",
  "BANK_TRANSFER",
  "OTHER",
] as const;

type PaymentMethodFilter =
  (typeof paymentMethods)[number];

const paymentStatuses = [
  "all",
  "valid",
  "voided",
] as const;

type PaymentStatusFilter =
  (typeof paymentStatuses)[number];

export default async function PaymentsPage({
  searchParams,
}: Props) {
  const params =
    await searchParams;

  const q =
    params.q?.trim() ?? "";

  /**
   * Validate the payment method coming from the URL.
   *
   * /payments?method=GCASH
   *
   * is allowed.
   *
   * /payments?method=something-random
   *
   * becomes undefined → All methods.
   */
  const requestedMethod =
    params.method as
    | PaymentMethodFilter
    | undefined;

  const method:
    PaymentMethodFilter | undefined =
    requestedMethod &&
      paymentMethods.includes(
        requestedMethod,
      )
      ? requestedMethod
      : undefined;

  /**
   * Same idea for payment status.
   */
  const requestedStatus =
    params.status as
    | PaymentStatusFilter
    | undefined;

  const status:
    PaymentStatusFilter =
    requestedStatus &&
      paymentStatuses.includes(
        requestedStatus,
      )
      ? requestedStatus
      : "all";

  const {
    landlord,
  } =
    await requireLandlord();
  const requestedPage =
    parsePage(
      params.page,
    );


  const paymentWhere = {
    /**
     * SECURITY / DATA ISOLATION
     * -------------------------
     *
     * This condition NEVER disappears.
     *
     * Search and filters only operate within
     * the authenticated landlord's payments.
     *
     * A landlord cannot search another landlord's
     * financial records just by changing query params.
     */

    landlordAccountId:
      landlord.id,

    ...(method
      ? {
        method,
      }
      : {}),

    ...(status ===
      "valid"
      ? {
        voidedAt:
          null,
      }
      : status ===
        "voided"
        ? {
          voidedAt: {
            not: null,
          },
        }
        : {}),

    ...(q
      ? {
        OR: [
          {
            tenant: {
              is: {
                fullName: {
                  contains:
                    q,

                  mode:
                    "insensitive",
                },
              },
            },
          },

          {
            referenceNumber: {
              contains:
                q,

              mode:
                "insensitive",
            },
          },
        ],
      }
      : {}),
  } satisfies Prisma.PaymentWhereInput;
  const totalPayments =
    await prisma.payment.count({
      where:
        paymentWhere,
    });

  const totalPages =
    getTotalPages(
      totalPayments,
    );

  const page =
    Math.min(
      requestedPage,
      totalPages,
    );


  const payments =
    await prisma.payment.findMany({
      where:
        paymentWhere,

      skip:
        getSkip(page),

      take:
        PAGE_SIZE,

      orderBy: [
        {
          paidAt:
            "desc",
        },

        {
          createdAt:
            "desc",
        },
      ],

      include: {
        tenant:
          true,

        allocations: {
          include: {
            rentCharge: {
              select: {
                periodYear:
                  true,

                periodMonth:
                  true,
              },
            },
          },
        },
      },
    });
  const validAggregate =
    status === "voided"
      ? null
      : await prisma.payment.aggregate({
        where: {
          ...paymentWhere,

          voidedAt:
            null,
        },

        _sum: {
          amount:
            true,
        },
      });

  /**
   * These totals describe the FILTERED result currently
   * on screen.
   *
   * We intentionally ignore voided payments when calculating
   * actual collected money.
   */
  const validTotal =
    validAggregate
      ? moneyToCents(
        validAggregate
          ._sum
          .amount ??
        "0",
      )
      : 0n;

  const voidedCount =
    payments.filter(
      (payment) =>
        payment.voidedAt !==
        null,
    ).length;

  const hasFilters =
    Boolean(q) ||
    Boolean(method) ||
    status !== "all";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Payments
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Search and review rent
            collection history.
          </p>
        </div>

        <Link
          href="/payments/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus
            size={18}
          />

          <span className="hidden sm:inline">
            Record payment
          </span>
        </Link>
      </div>

      {/* FILTERS */}
      <form
        method="GET"
        className="mt-6 grid gap-3 lg:grid-cols-[1fr_190px_170px_auto_auto]"
      >
        {/* SEARCH */}
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search tenant or reference..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        {/* METHOD */}
        <select
          name="method"
          defaultValue={
            method ?? ""
          }
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-500"
        >
          <option value="">
            All methods
          </option>

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

        {/* STATUS */}
        <select
          name="status"
          defaultValue={
            status
          }
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-500"
        >
          <option value="all">
            All statuses
          </option>

          <option value="valid">
            Valid
          </option>

          <option value="voided">
            Voided
          </option>
        </select>

        <button
          type="submit"
          className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Search
        </button>

        {hasFilters && (
          <Link
            href="/payments"
            aria-label="Clear filters"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
          >
            <X
              size={17}
            />
          </Link>
        )}
      </form>

      {/* FILTER SUMMARY */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span>
          {payments.length}{" "}
          {payments.length === 1
            ? "payment"
            : "payments"}
        </span>

        <span>·</span>

        <span>
          Valid total{" "}
          <span className="font-medium text-zinc-800">
            {formatPHP(
              validTotal,
            )}
          </span>
        </span>

        {voidedCount > 0 && (
          <>
            <span>·</span>

            <span>
              {voidedCount} voided
            </span>
          </>
        )}

        {q && (
          <>
            <span>·</span>

            <span className="rounded-lg bg-zinc-100 px-2 py-1 font-medium text-zinc-700">
              &quot;
              {q}
              &quot;
            </span>
          </>
        )}
      </div>

      {/* EMPTY STATE */}
      {payments.length ===
        0 ? (
        <PaymentEmptyState
          hasFilters={
            hasFilters
          }
        />
      ) : (<>
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {payments.map(
              (payment) => (
                <Link
                  key={
                    payment.id
                  }
                  href={`/payments/${payment.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50 sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-zinc-950">
                        {
                          payment
                            .tenant
                            .fullName
                        }
                      </p>

                      {/* PAYMENT METHOD BADGE */}
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                        {formatMethod(
                          payment.method,
                        )}
                      </span>

                      {/* VOIDED STATUS */}
                      {payment.voidedAt && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                          VOIDED
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
                      <span>
                        {payment.paidAt.toLocaleDateString(
                          "en-PH",
                        )}
                      </span>

                      {payment.referenceNumber && (
                        <>
                          <span>
                            ·
                          </span>

                          <span className="truncate">
                            Ref:{" "}
                            {
                              payment.referenceNumber
                            }
                          </span>
                        </>
                      )}
                    </div>

                    {/* ALLOCATION SUMMARY */}
                    {payment.allocations
                      .length >
                      0 && (
                        <p className="mt-2 text-xs text-zinc-400">
                          {formatAllocationSummary(
                            payment.allocations,
                          )}
                        </p>
                      )}
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    <div className="text-right">
                      <p
                        className={[
                          "font-semibold",

                          payment.voidedAt
                            ? "text-zinc-400 line-through"
                            : "text-zinc-950",
                        ].join(
                          " ",
                        )}
                      >
                        {formatPHP(
                          moneyToCents(
                            payment.amount,
                          ),
                        )}
                      </p>

                      {payment.voidedAt && (
                        <p className="mt-1 text-xs font-medium text-red-600">
                          Not counted
                        </p>
                      )}
                    </div>

                    <ChevronRight
                      size={18}
                      className="text-zinc-400"
                    />
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>

        <Pagination
          basePath="/payments"
          page={page}
          totalPages={
            totalPages
          }
          totalItems={
            totalPayments
          }
          pageSize={
            PAGE_SIZE
          }
          query={{
            q:
              q || undefined,

            method,

            status:
              status === "all"
                ? undefined
                : status,
          }}
        />
      </>
      )}
    </div>
  );
}

/**
 * Turns:
 *
 * BANK_TRANSFER
 *
 * into:
 *
 * Bank Transfer
 */
function formatMethod(
  method: string,
) {
  return method
    .replaceAll(
      "_",
      " ",
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

/**
 * Gives the landlord a quick idea of what
 * months this payment was allocated to.
 *
 * Example:
 *
 * 1 charge:
 *
 *   September 2026
 *
 * Multiple:
 *
 *   August 2026 · September 2026
 */
function formatAllocationSummary(
  allocations: {
    rentCharge: {
      periodYear: number;
      periodMonth: number;
    };
  }[],
) {
  return allocations
    .map(
      ({
        rentCharge,
      }) =>
        new Intl.DateTimeFormat(
          "en-PH",
          {
            month:
              "short",

            year:
              "numeric",

            timeZone:
              "Asia/Manila",
          },
        ).format(
          new Date(
            Date.UTC(
              rentCharge.periodYear,
              rentCharge.periodMonth -
              1,
              1,
            ),
          ),
        ),
    )
    .join(" · ");
}

function PaymentEmptyState({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  if (
    hasFilters
  ) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
        <Search
          size={36}
          className="mx-auto text-zinc-400"
        />

        <h2 className="mt-4 font-semibold text-zinc-950">
          No payments found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          No payment records match the
          current search and filters.
        </p>

        <Link
          href="/payments"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <X
            size={16}
          />

          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
      <CreditCard
        size={38}
        className="mx-auto text-zinc-400"
      />

      <h2 className="mt-4 font-semibold text-zinc-950">
        No payments yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Record your first rent payment to
        begin building collection history.
      </p>

      <Link
        href="/payments/new"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        <Plus
          size={17}
        />

        Record payment
      </Link>
    </div>
  );
}