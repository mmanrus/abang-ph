import Link from "next/link";

import {
  ChevronRight,
  Plus,
  UsersRound,
} from "lucide-react";

import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";

export default async function TenantsPage() {
  const { landlord } =
    await requireLandlord();

  const tenants =
    await prisma.tenant.findMany({
      where: {
        landlordAccountId:
          landlord.id,

        deletedAt: null,
      },

      orderBy: {
        fullName: "asc",
      },

      include: {
        leases: {
          where: {
            status: "ACTIVE",
            deletedAt: null,
          },

          include: {
            rentableSpace: {
              include: {
                unit: {
                  include: {
                    property: true,
                  },
                },
              },
            },
          },
        },
      },
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Tenants
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage tenants and their
            current rental assignments.
          </p>
        </div>

        <Link
          href="/tenants/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />

          <span className="hidden sm:inline">
            Add tenant
          </span>
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <UsersRound
            size={38}
            className="mx-auto text-zinc-400"
          />

          <h2 className="mt-4 font-semibold text-zinc-950">
            No tenants yet
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Add a tenant and assign them
            to a rentable space.
          </p>

          <Link
            href="/tenants/new"
            className="mt-5 inline-flex rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white"
          >
            Add first tenant
          </Link>
        </div>
      ) : (
        <div className="mt-7 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {tenants.map(
            (tenant) => {
              const activeLease =
                tenant.leases[0];

              return (
                <Link
                  key={tenant.id}
                  href={`/tenants/${tenant.id}`}
                  className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700">
                        {tenant.fullName
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate font-semibold text-zinc-950">
                          {tenant.fullName}
                        </h2>

                        <p className="truncate text-sm text-zinc-500">
                          {tenant.phone ??
                            tenant.email ??
                            "No contact information"}
                        </p>
                      </div>
                    </div>

                    <ChevronRight
                      size={19}
                      className="shrink-0 text-zinc-400 transition group-hover:translate-x-1"
                    />
                  </div>

                  <div className="mt-5 border-t border-zinc-100 pt-4">
                    {activeLease ? (
                      <>
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                          Current space
                        </p>

                        <p className="mt-1 font-medium text-zinc-900">
                          {
                            activeLease
                              .rentableSpace
                              .unit
                              .property
                              .name
                          }
                        </p>

                        <p className="text-sm text-zinc-500">
                          {
                            activeLease
                              .rentableSpace
                              .unit.name
                          }
                          {" · "}
                          {
                            activeLease
                              .rentableSpace
                              .name
                          }
                        </p>

                        <p className="mt-3 text-sm font-semibold text-zinc-950">
                          ₱
                          {Number(
                            activeLease.monthlyRent,
                          ).toLocaleString(
                            "en-PH",
                            {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            },
                          )}
                          /month
                        </p>
                      </>
                    ) : (
                      <div className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        No active lease
                      </div>
                    )}
                  </div>
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}