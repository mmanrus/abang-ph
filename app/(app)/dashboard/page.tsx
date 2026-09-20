import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  Building2,
  CircleDollarSign,
  Home,
  ReceiptText,
  TrendingUp,
  UsersRound,
  WalletCards,
} from "lucide-react";

import type {
  Metadata,
} from "next";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  formatPHP,
  moneyToCents,
} from "@/lib/money";

import {
  getLandlordDashboard,
} from "@/server/services/dashboard.service";

export const metadata: Metadata = {
  title:
    "Dashboard",
};

export default async function DashboardPage() {
  const {
    user,
  } =
    await requireLandlord();

  const {
    landlord,
  } =
    await requireLandlord();

  const dashboard =
    await getLandlordDashboard({
      landlordAccountId:
        landlord.id,
    });

  const monthLabel =
    new Intl.DateTimeFormat(
      "en-PH",
      {
        month:
          "long",

        year:
          "numeric",

        timeZone:
          "Asia/Manila",
      },
    ).format(
      new Date(
        Date.UTC(
          dashboard.period.year,

          dashboard.period.month -
            1,

          1,
        ),
      ),
    );

  return (
    <div className="mx-auto w-full max-w-7xl overflow-x-hidden px-4 py-5 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      {/* ================================================== */}
      {/* WELCOME                                            */}
      {/* ================================================== */}

      <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-white p-5 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              {monthLabel}
            </p>

            <h1 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Welcome back,{" "}
              {user.name}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
              Here&apos;s how your rental business is doing this month.
            </p>
          </div>

          <Link
            href="/rent"
            className="inline-flex min-h-11 w-fit shrink-0 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
          >
            Rent & collections

            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      {/* ================================================== */}
      {/* METRICS                                            */}
      {/* ================================================== */}

      <section
        aria-label="Monthly rental summary"
        className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        <MetricCard
          icon={
            CircleDollarSign
          }
          label="Expected rent"
          value={formatPHP(
            dashboard.expected,
          )}
          tone="neutral"
        />

        <MetricCard
          icon={
            TrendingUp
          }
          label="Collected"
          value={formatPHP(
            dashboard.collected,
          )}
          tone="positive"
        />

        <MetricCard
          icon={
            AlertCircle
          }
          label="Outstanding"
          value={formatPHP(
            dashboard.outstanding,
          )}
          tone={
            dashboard.outstanding >
            0n
              ? "warning"
              : "positive"
          }
        />

        <MetricCard
          icon={Home}
          label="Occupancy"
          value={`${dashboard.occupancyRate}%`}
          supporting={`${dashboard.occupiedSpaces} of ${dashboard.totalSpaces} spaces`}
          progress={
            dashboard.occupancyRate
          }
          tone="neutral"
        />
      </section>

      {/* ================================================== */}
      {/* PRIMARY CONTENT                                    */}
      {/* ================================================== */}

      <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        {/* ================================================ */}
        {/* NEEDS ATTENTION                                  */}
        {/* ================================================ */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <SectionHeader
            title="Needs attention"
            description="Outstanding and overdue rent."
            href="/rent"
            action="View rent"
          />

          {dashboard.attention
            .length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl font-semibold text-emerald-700">
                ✓
              </div>

              <p className="mt-4 font-medium text-zinc-900">
                Everything is caught up
              </p>

              <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-zinc-500">
                No outstanding rent needs your attention right now.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {dashboard.attention.map(
                (item) => (
                  <Link
                    key={
                      item.chargeId
                    }
                    href="/rent"
                    className="block px-5 py-4 transition hover:bg-zinc-50 sm:px-6"
                  >
                    {/*
                     * MOBILE
                     *
                     * We intentionally stack the tenant/details
                     * and money instead of forcing everything
                     * into one horizontal row.
                     *
                     * This prevents long names/status/location
                     * from pushing the balance outside the
                     * viewport.
                     */}
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <p className="min-w-0 break-words font-medium text-zinc-950">
                            {
                              item.tenantName
                            }
                          </p>

                          <StatusBadge
                            tone={
                              item.status ===
                              "OVERDUE"
                                ? "red"
                                : "amber"
                            }
                          >
                            {item.status.replaceAll(
                              "_",
                              " ",
                            )}
                          </StatusBadge>
                        </div>

                        <p className="mt-1 break-words text-sm leading-5 text-zinc-500 sm:truncate">
                          {
                            item.location
                          }
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-right">
                        <span className="text-xs font-medium text-zinc-400 sm:hidden">
                          Balance
                        </span>

                        <p className="text-base font-semibold tabular-nums text-zinc-950">
                          {formatPHP(
                            item.balance,
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>

        {/* ================================================ */}
        {/* RECENT PAYMENTS                                  */}
        {/* ================================================ */}

        <section className="min-w-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <SectionHeader
            title="Recent payments"
            description="Latest rent collections."
            href="/payments"
            action="View all"
          />

          {dashboard.recentPayments
            .length === 0 ? (
            <div className="px-5 py-12 text-center sm:px-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
                <WalletCards
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-4 font-medium text-zinc-900">
                No payments yet
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Recorded collections will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {dashboard.recentPayments.map(
                (payment) => (
                  <Link
                    key={
                      payment.id
                    }
                    href={`/payments/${payment.id}`}
                    className="block px-5 py-4 transition hover:bg-zinc-50 sm:px-6"
                  >
                    <div className="flex min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="min-w-0">
                        <p className="break-words font-medium text-zinc-950 sm:truncate">
                          {
                            payment
                              .tenant
                              .fullName
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                          <span>
                            {
                              payment.method
                            }
                          </span>

                          <span
                            aria-hidden="true"
                          >
                            ·
                          </span>

                          <span>
                            {payment.paidAt.toLocaleDateString(
                              "en-PH",
                              {
                                month:
                                  "short",

                                day:
                                  "numeric",

                                year:
                                  "numeric",
                              },
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-right">
                        <span className="text-xs font-medium text-zinc-400 sm:hidden">
                          Received
                        </span>

                        <p className="font-semibold tabular-nums text-emerald-700">
                          +
                          {formatPHP(
                            moneyToCents(
                              payment.amount,
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      {/* ================================================== */}
      {/* QUICK OVERVIEW                                     */}
      {/* ================================================== */}

      <section className="mt-5">
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-semibold text-zinc-950">
              Quick overview
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Jump back into your most-used rental records.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <QuickLink
            href="/properties"
            icon={
              Building2
            }
            label="Properties"
            value={String(
              dashboard.properties,
            )}
            description="Rental locations"
          />

          <QuickLink
            href="/tenants"
            icon={
              UsersRound
            }
            label="Occupied spaces"
            value={String(
              dashboard.occupiedSpaces,
            )}
            description={`${dashboard.totalSpaces} total spaces`}
          />

          <QuickLink
            href="/rent"
            icon={
              ReceiptText
            }
            label="Rent charges"
            value={
              monthLabel
            }
            description="Open rent ledger"
          />
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  href,
  action,
}: {
  title:
    string;

  description:
    string;

  href:
    string;

  action:
    string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:items-center sm:px-6">
      <div className="min-w-0">
        <h2 className="font-semibold text-zinc-950">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-zinc-500">
          {description}
        </p>
      </div>

      <Link
        href={href}
        className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-800"
      >
        {action}

        <ArrowRight
          size={14}
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  supporting,
  progress,
  tone,
}: {
  icon:
    React.ElementType;

  label:
    string;

  value:
    string;

  supporting?:
    string;

  progress?:
    number;

  tone:
    | "neutral"
    | "positive"
    | "warning";
}) {
  const toneClasses = {
    neutral:
      "bg-zinc-100 text-zinc-600",

    positive:
      "bg-emerald-50 text-emerald-700",

    warning:
      "bg-amber-50 text-amber-700",
  };

  return (
    <article className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={[
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",

            toneClasses[
              tone
            ],
          ].join(" ")}
        >
          <Icon
            size={16}
            aria-hidden="true"
          />
        </div>

        <p className="min-w-0 text-xs font-medium leading-4 text-zinc-500 sm:text-sm">
          {label}
        </p>
      </div>

      <p className="mt-4 break-words text-xl font-semibold tracking-tight tabular-nums text-zinc-950 sm:text-2xl">
        {value}
      </p>

      {supporting && (
        <p className="mt-1 text-xs text-zinc-500">
          {supporting}
        </p>
      )}

      {typeof progress ===
        "number" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{
              width:
                `${Math.min(
                  100,
                  Math.max(
                    0,
                    progress,
                  ),
                )}%`,
            }}
          />
        </div>
      )}
    </article>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  value,
  description,
}: {
  href:
    string;

  icon:
    React.ElementType;

  label:
    string;

  value:
    string;

  description:
    string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-w-0 items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-200 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
        <Icon
          size={19}
          aria-hidden="true"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-zinc-500">
          {label}
        </p>

        <p className="mt-0.5 truncate font-semibold text-zinc-950">
          {value}
        </p>

        <p className="mt-0.5 truncate text-xs text-zinc-400">
          {description}
        </p>
      </div>

      <ArrowRight
        size={16}
        aria-hidden="true"
        className="shrink-0 text-zinc-300 transition group-hover:translate-x-0.5 group-hover:text-emerald-600"
      />
    </Link>
  );
}