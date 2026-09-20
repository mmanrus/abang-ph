import Link from "next/link";

import {
  AlertCircle,
  ArrowRight,
  Building2,
  CircleDollarSign,
  Home,
  UsersRound,
} from "lucide-react";

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
import { StatusBadge } from "@/components/ui/status-badge";
import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};
export default async function DashboardPage() {
  const {
    user,
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
        month: "long",
        year: "numeric",
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-zinc-500">
            {monthLabel}
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
            Welcome back,{" "}
            {user.name}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Here&apos;s how your
            rental business is doing.
          </p>
        </div>

        <Link
          href="/rent"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          Rent & Collections

          <ArrowRight
            size={16}
          />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <MetricCard
          icon={
            CircleDollarSign
          }
          label="Expected Rent"
          value={formatPHP(
            dashboard.expected,
          )}
        />

        <MetricCard
          icon={
            CircleDollarSign
          }
          label="Collected"
          value={formatPHP(
            dashboard.collected,
          )}
        />

        <MetricCard
          icon={
            AlertCircle
          }
          label="Outstanding"
          value={formatPHP(
            dashboard.outstanding,
          )}
        />

        <MetricCard
          icon={Home}
          label="Occupancy"
          value={`${dashboard.occupancyRate}%`}
          supporting={`${dashboard.occupiedSpaces} of ${dashboard.totalSpaces} spaces`}
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-zinc-950">
                Needs attention
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Outstanding and
                overdue rent.
              </p>
            </div>

            <Link
              href="/rent"
              className="text-sm font-medium text-emerald-700"
            >
              View rent
            </Link>
          </div>

          {dashboard.attention
            .length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                ✓
              </div>

              <p className="mt-4 font-medium text-zinc-900">
                Everything is
                caught up
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                No outstanding
                rent needs your
                attention.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {dashboard.attention.map(
                (item) => (
                  <div
                    key={
                      item.chargeId
                    }
                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-zinc-950">
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

                      <p className="mt-1 truncate text-sm text-zinc-500">
                        {
                          item.location
                        }
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-zinc-950">
                      {formatPHP(
                        item.balance,
                      )}
                    </p>
                  </div>
                ),
              )}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold text-zinc-950">
                Recent payments
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Latest rent
                collections.
              </p>
            </div>

            <Link
              href="/payments"
              className="text-sm font-medium text-emerald-700"
            >
              View all
            </Link>
          </div>

          {dashboard.recentPayments
            .length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No payments yet.
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
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50 sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-950">
                        {
                          payment
                            .tenant
                            .fullName
                        }
                      </p>

                      <p className="mt-1 text-xs text-zinc-500">
                        {
                          payment.method
                        }
                        {" · "}
                        {payment.paidAt.toLocaleDateString(
                          "en-PH",
                        )}
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-emerald-700">
                      {formatPHP(
                        moneyToCents(
                          payment.amount,
                        ),
                      )}
                    </p>
                  </Link>
                ),
              )}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <QuickLink
          href="/properties"
          icon={Building2}
          label="Properties"
          value={String(
            dashboard.properties,
          )}
        />

        <QuickLink
          href="/tenants"
          icon={UsersRound}
          label="Occupied spaces"
          value={String(
            dashboard.occupiedSpaces,
          )}
        />

        <QuickLink
          href="/rent"
          icon={
            CircleDollarSign
          }
          label="Rent charges"
          value={monthLabel}
        />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  supporting,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  supporting?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center gap-2 text-zinc-500">
        <Icon size={17} />

        <p className="text-xs font-medium sm:text-sm">
          {label}
        </p>
      </div>

      <p className="mt-3 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
        {value}
      </p>

      {supporting && (
        <p className="mt-1 text-xs text-zinc-500">
          {supporting}
        </p>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-xs text-zinc-500">
          {label}
        </p>

        <p className="mt-0.5 font-semibold text-zinc-950">
          {value}
        </p>
      </div>
    </Link>
  );
}