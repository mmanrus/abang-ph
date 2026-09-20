import Link from "next/link";

import {
  Home,
  Mail,
  Phone,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import type {
  Prisma,
} from "@/generated/prisma/client";
import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title: "Tenants",
};
import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  PAGE_SIZE,
  getSkip,
  getTotalPages,
  parsePage,
} from "@/lib/pagination";

import {
  formatPHP,
  moneyToCents,
} from "@/lib/money";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  prisma,
} from "@/lib/db/prisma";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

const tenantStatuses = [
  "active",
  "inactive",
  "all",
] as const;

type TenantStatusFilter =
  (typeof tenantStatuses)[number];

export default async function TenantsPage({
  searchParams,
}: Props) {
  /**
   * Next.js searchParams
   * --------------------
   *
   * URL:
   *
   * /tenants?q=juan&status=active
   *
   * becomes:
   *
   * {
   *   q: "juan",
   *   status: "active"
   * }
   *
   * In current App Router versions searchParams is async,
   * so we await it before reading its values.
   */
  const params =
    await searchParams;

  const q =
    params.q?.trim() ?? "";
  const requestedPage =
    parsePage(
      params.page,
    );
  /**
   * Browser input should never be blindly trusted.
   *
   * Someone could manually type:
   *
   * ?status=potato
   *
   * Instead of sending that directly into Prisma,
   * we whitelist the values our application understands.
   */
  const requestedStatus =
    params.status as
    | TenantStatusFilter
    | undefined;

  const status:
    TenantStatusFilter =
    requestedStatus &&
      tenantStatuses.includes(
        requestedStatus,
      )
      ? requestedStatus
      : "active";

  const {
    landlord,
  } =
    await requireLandlord();

  const tenantWhere = {
    landlordAccountId:
      landlord.id,

    deletedAt: null,

    ...(status ===
      "active"
      ? {
        isActive:
          true,
      }
      : status ===
        "inactive"
        ? {
          isActive:
            false,
        }
        : {}),

    ...(q
      ? {
        OR: [
          {
            fullName: {
              contains:
                q,

              mode:
                "insensitive",
            },
          },

          {
            phone: {
              contains:
                q,

              mode:
                "insensitive",
            },
          },

          {
            email: {
              contains:
                q,

              mode:
                "insensitive",
            },
          },
        ],
      }
      : {}),
  } satisfies Prisma.TenantWhereInput;
  const totalTenants =
    await prisma.tenant.count({
      where:
        tenantWhere,
    });

  const totalPages =
    getTotalPages(
      totalTenants,
    );

  /**
   * Clamp invalid URLs.
   *
   * Example:
   *
   * /tenants?page=999
   *
   * but only 3 pages exist.
   *
   * We safely load page 3.
   */
  const page =
    Math.min(
      requestedPage,
      totalPages,
    );

  const tenants =
    await prisma.tenant.findMany({
      where:
        tenantWhere,

      skip:
        getSkip(
          page,
        ),

      take:
        PAGE_SIZE,

      include: {
        leases: {
          where: {
            status:
              "ACTIVE",

            deletedAt:
              null,
          },

          orderBy: {
            startDate:
              "desc",
          },

          take: 1,

          include: {
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

      orderBy: [
        {
          isActive:
            "desc",
        },

        {
          fullName:
            "asc",
        },

        /**
         * Stable secondary sorting helps pagination remain
         * deterministic when tenants have identical names.
         */
        {
          id:
            "asc",
        },
      ],
    });

  type TenantRow =
    (typeof tenants)[number];

  const tenantColumns:
    DataTableColumn<TenantRow>[] =
    [
      {
        key:
          "tenant",

        header:
          "Tenant",

        cell: (
          tenant,
        ) => (
          <Link
            href={`/tenants/${tenant.id}`}
            className="font-medium text-zinc-950 hover:text-emerald-700"
          >
            {
              tenant.fullName
            }
          </Link>
        ),
      },

      {
        key:
          "contact",

        header:
          "Contact",

        cell: (
          tenant,
        ) => (
          <div className="space-y-1">
            <p className="text-zinc-700">
              {tenant.phone ??
                "No phone"}
            </p>

            <p className="max-w-56 truncate text-xs text-zinc-500">
              {tenant.email ??
                "No email"}
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
          tenant,
        ) => {
          const lease =
            tenant
              .leases[0];

          if (!lease) {
            return (
              <span className="text-zinc-400">
                No active lease
              </span>
            );
          }

          return (
            <div>
              <p className="font-medium text-zinc-800">
                {
                  lease
                    .rentableSpace
                    .unit
                    .property
                    .name
                }
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                {
                  lease
                    .rentableSpace
                    .unit
                    .name
                }
                {" · "}
                {
                  lease
                    .rentableSpace
                    .name
                }
              </p>
            </div>
          );
        },
      },

      {
        key:
          "rent",

        header:
          "Monthly Rent",

        headerClassName:
          "text-right",

        className:
          "text-right",

        cell: (
          tenant,
        ) => {
          const lease =
            tenant
              .leases[0];

          if (!lease) {
            return "—";
          }

          return (
            <span className="font-medium tabular-nums text-zinc-900">
              {formatPHP(
                moneyToCents(
                  lease.monthlyRent,
                ),
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
          tenant,
        ) => (
          <StatusBadge
            tone={
              tenant.isActive
                ? "green"
                : "gray"
            }
          >
            {tenant.isActive
              ? "ACTIVE"
              : "INACTIVE"}
          </StatusBadge>
        ),
      },

      {
        key:
          "actions",

        header:
          "",

        className:
          "text-right",

        cell: (
          tenant,
        ) => (
          <Link
            href={`/tenants/${tenant.id}`}
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            View
          </Link>
        ),
      },
    ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Tenants
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage active and former
            tenants across your rental
            properties.
          </p>
        </div>

        <Link
          href="/tenants/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus
            size={18}
          />

          <span className="hidden sm:inline">
            Add tenant
          </span>
        </Link>
      </div>

      {/* SEARCH + FILTER */}
      <form
        method="GET"
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
          />

          <input
            type="search"
            name="q"
            defaultValue={
              q
            }
            placeholder="Search name, phone, or email..."
            className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </div>

        <select
          name="status"
          defaultValue={
            status
          }
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-500"
        >
          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>

          <option value="all">
            All tenants
          </option>
        </select>

        <button
          type="submit"
          className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          Search
        </button>

        {(q ||
          status !==
          "active") && (
            <Link
              href="/tenants"
              aria-label="Clear filters"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <X
                size={17}
              />
            </Link>
          )}
      </form>

      {/* RESULT SUMMARY */}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <span>
          {tenants.length}{" "}
          {tenants.length ===
            1
            ? "tenant"
            : "tenants"}
        </span>

        <span>·</span>

        <span className="capitalize">
          {status ===
            "all"
            ? "All records"
            : status}
        </span>

        {q && (
          <>
            <span>·</span>

            <span>
              Search:
            </span>

            <span className="rounded-lg bg-zinc-100 px-2 py-1 font-medium text-zinc-700">
              &quot;
              {q}
              &quot;
            </span>
          </>
        )}
      </div>

      {/* EMPTY STATE */}
      {tenants.length ===
        0 ? (
        <TenantEmptyState
          q={q}
          status={
            status
          }
        />
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 lg:hidden">
            {tenants.map(
              (tenant) => {
                const activeLease =
                  tenant
                    .leases[0];

                return (
                  <Link
                    key={`tenant-${tenant.id}`}
                    href={`/tenants/${tenant.id}`}
                    className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                  >
                    {/* TENANT HEADER */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700">
                          {tenant.fullName
                            .charAt(
                              0,
                            )
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-zinc-950 group-hover:text-emerald-700">
                            {
                              tenant.fullName
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-zinc-500">
                            Tenant
                          </p>
                        </div>
                      </div>

                      <span
                        className={[
                          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",

                          tenant.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-600",
                        ].join(
                          " ",
                        )}
                      >
                        {tenant.isActive
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>

                    {/* CONTACT */}
                    <div className="mt-5 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Phone
                          size={15}
                          className="shrink-0"
                        />

                        <span className="truncate">
                          {tenant.phone ??
                            "No phone"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <Mail
                          size={15}
                          className="shrink-0"
                        />

                        <span className="truncate">
                          {tenant.email ??
                            "No email"}
                        </span>
                      </div>
                    </div>

                    {/* CURRENT LEASE */}
                    <div className="mt-5 border-t border-zinc-100 pt-4">
                      {activeLease ? (
                        <div>
                          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                            <Home
                              size={14}
                            />

                            Current lease
                          </div>

                          <p className="mt-2 text-sm font-medium text-zinc-900">
                            {
                              activeLease
                                .rentableSpace
                                .unit
                                .property
                                .name
                            }
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {
                              activeLease
                                .rentableSpace
                                .unit
                                .name
                            }
                            {" · "}
                            {
                              activeLease
                                .rentableSpace
                                .name
                            }
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                          <UserRound
                            size={15}
                          />

                          {tenant.isActive
                            ? "No active lease"
                            : "Former tenant"}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              },
            )}
          </div>
          <div className="mt-6 hidden lg:block">
            <DataTable
              rows={tenants}
              columns={
                tenantColumns
              }
              rowKey={(
                tenant,
              ) =>
                tenant.id
              }
            />
          </div>
          <Pagination
            basePath="/tenants"
            page={page}
            totalPages={
              totalPages
            }
            totalItems={
              totalTenants
            }
            pageSize={
              PAGE_SIZE
            }
            query={{
              q:
                q || undefined,

              status:
                status ===
                  "active"
                  ? undefined
                  : status,
            }}
          />
        </>
      )}
    </div>
  );
}

function TenantEmptyState({
  q,
  status,
}: {
  q: string;
  status:
  TenantStatusFilter;
}) {
  /**
   * We explain WHY the list is empty instead of always
   * showing "No tenants".
   *
   * Empty because:
   *
   * no tenants exist
   *
   * is different from:
   *
   * search/filter returned nothing.
   */
  if (
    q ||
    status !==
    "active"
  ) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
        <Search
          size={36}
          className="mx-auto text-zinc-400"
        />

        <h2 className="mt-4 font-semibold text-zinc-950">
          No tenants found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
          No tenants match the current
          search and status filters.
        </p>

        <Link
          href="/tenants"
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
      <UserRound
        size={38}
        className="mx-auto text-zinc-400"
      />

      <h2 className="mt-4 font-semibold text-zinc-950">
        No tenants yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
        Add your first tenant, then assign
        them to an available rental space.
      </p>

      <Link
        href="/tenants/new"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
      >
        <Plus
          size={17}
        />

        Add tenant
      </Link>
    </div>
  );
}