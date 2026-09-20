import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Mail,
  Pencil,
  UserX,
  Phone,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  CreateLeaseForm,
} from "@/components/tenants/create-lease-form";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  endLeaseAction,
} from "../actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { ConfirmForm } from "@/components/forms/confirm-form";
import { DestructiveActionForm } from "@/components/forms/destructive-action-form";
import { deactivateTenantAction } from "../manage-actions";
import { SuccessBanner } from "@/components/feedback/success-banner";

type Props = {
  params: Promise<{
    tenantId: string;
  }>;

  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function TenantPage({
  params,
  searchParams,
}: Props) {
  const {
    tenantId,
  } =
    await params;

  const query =
    await searchParams;

  const { landlord } =
    await requireLandlord();

  const tenant =
    await prisma.tenant.findFirst({
      where: {
        id: tenantId,

        landlordAccountId:
          landlord.id,

        deletedAt: null,
      },

      include: {
        leases: {
          where: {
            deletedAt: null,
          },

          orderBy: {
            createdAt: "desc",
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

  if (!tenant) {
    notFound();
  }

  const availableSpaces =
    await prisma.rentableSpace.findMany({
      where: {
        deletedAt: null,

        status: "AVAILABLE",

        unit: {
          is: {
            deletedAt: null,

            property: {
              is: {
                landlordAccountId:
                  landlord.id,

                deletedAt: null,

                isActive: true,
              },
            },
          },
        },
      },

      orderBy: {
        name: "asc",
      },

      include: {
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

  const activeLeases =
    tenant.leases.filter(
      (lease) =>
        lease.status ===
        "ACTIVE",
    );

  const leaseHistory =
    tenant.leases.filter(
      (lease) =>
        lease.status !==
        "ACTIVE",
    );

  const spaceOptions =
    availableSpaces.map(
      (space) => ({
        id: space.id,

        label: [
          space.unit.property.name,
          space.unit.name,
          space.name,
        ].join(" · "),

        defaultRent:
          space.defaultRent
            ? space.defaultRent.toString()
            : null,
      }),
    );

  return (

    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">


      <Link
        href="/tenants"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft size={17} />

        Tenants
      </Link>
      <SuccessBanner
        code={
          query.success
        }
      />
      <div className="mt-5">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xl font-semibold text-emerald-700">
              {tenant.fullName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                  {tenant.fullName}
                </h1>

                <span
                  className={[
                    "rounded-full px-2.5 py-1 text-xs font-medium",
                    tenant.isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-zinc-100 text-zinc-600",
                  ].join(" ")}
                >
                  {tenant.isActive
                    ? "ACTIVE"
                    : "INACTIVE"}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-500">
                {tenant.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone
                      size={15}
                    />

                    {tenant.phone}
                  </span>
                )}

                {tenant.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail
                      size={15}
                    />

                    {tenant.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/tenants/${tenant.id}/edit`}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <Pencil
              size={16}
            />

            Edit tenant
          </Link>
        </div>
      </div>
      {!tenant.isActive && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-100 p-4">
          <p className="font-medium text-zinc-800">
            This tenant is inactive.
          </p>

          <p className="mt-1 text-sm text-zinc-500">
            Historical leases, rent charges, and payments remain available for reference.
          </p>
        </div>
      )}
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div>
          <h2 className="font-semibold text-zinc-950">
            Tenant information
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Contact and emergency information for this tenant.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <TenantInfo
            label="Phone"
            value={
              tenant.phone ??
              "Not provided"
            }
          />

          <TenantInfo
            label="Email"
            value={
              tenant.email ??
              "Not provided"
            }
          />

          <TenantInfo
            label="Emergency contact"
            value={
              tenant.emergencyContactName ??
              "Not provided"
            }
          />

          <TenantInfo
            label="Emergency phone"
            value={
              tenant.emergencyContactPhone ??
              "Not provided"
            }
          />
        </div>

        {tenant.notes && (
          <div className="mt-6 border-t border-zinc-100 pt-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
              {tenant.notes}
            </p>
          </div>
        )}
      </section>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-6">
          {/* CURRENT LEASE */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-zinc-950">
              Current lease
            </h2>

            {activeLeases.length === 0 ? (
              <div className="mt-5 rounded-xl bg-zinc-50 p-5">
                <p className="font-medium text-zinc-800">
                  No active lease
                </p>

                <p className="mt-1 text-sm text-zinc-500">
                  Assign this tenant to an available rental space.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {activeLeases.map(
                  (lease) => (
                    <div
                      key={lease.id}
                      className="rounded-xl border border-zinc-200 p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                            <Building2
                              size={16}
                            />

                            {
                              lease
                                .rentableSpace
                                .unit
                                .property
                                .name
                            }
                          </div>

                          <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                            {
                              lease
                                .rentableSpace
                                .unit.name
                            }
                            {" · "}
                            {
                              lease
                                .rentableSpace
                                .name
                            }
                          </h3>

                          <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-950">
                            ₱
                            {Number(
                              lease.monthlyRent,
                            ).toLocaleString(
                              "en-PH",
                            )}
                            <span className="text-sm font-normal text-zinc-500">
                              /month
                            </span>
                          </p>

                          <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-500">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays
                                size={15}
                              />

                              Started{" "}
                              {lease.startDate.toLocaleDateString(
                                "en-PH",
                              )}
                            </span>

                            <span>
                              Due every day{" "}
                              {
                                lease.dueDay
                              }
                            </span>
                          </div>
                        </div>

                        <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          ACTIVE
                        </span>
                      </div>

                      <ConfirmForm
                        action={endLeaseAction.bind(
                          null,
                          tenant.id,
                          lease.id,
                        )}
                        message={`End the lease for ${tenant.fullName}? The rental space will become available again.`}
                      >
                        <SubmitButton
                          pendingText="Ending lease..."
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          End lease
                        </SubmitButton>
                      </ConfirmForm>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {/* HISTORY */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="font-semibold text-zinc-950">
              Lease history
            </h2>

            {leaseHistory.length ===
              0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                No previous leases.
              </p>
            ) : (
              <div className="mt-4 divide-y divide-zinc-100">
                {leaseHistory.map(
                  (lease) => (
                    <div
                      key={lease.id}
                      className="py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex justify-between gap-4">
                        <div>
                          <p className="font-medium text-zinc-900">
                            {
                              lease
                                .rentableSpace
                                .unit
                                .property
                                .name
                            }
                          </p>

                          <p className="text-sm text-zinc-500">
                            {
                              lease
                                .rentableSpace
                                .unit.name
                            }
                            {" · "}
                            {
                              lease
                                .rentableSpace
                                .name
                            }
                          </p>
                        </div>

                        <span className="text-xs font-medium text-zinc-500">
                          {
                            lease.status
                          }
                        </span>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>
        </div>

        {/* CREATE LEASE */}
        <aside>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 xl:sticky xl:top-8">
            <h2 className="font-semibold text-zinc-950">
              Assign rental space
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Create a lease and assign an
              available space to this tenant.
            </p>

            {spaceOptions.length ===
              0 ? (
              <div className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                No available rentable spaces.
                Add another room/space or end an
                existing lease first.
              </div>
            ) : (
              <div className="mt-5">
                <CreateLeaseForm
                  tenantId={
                    tenant.id
                  }
                  spaces={
                    spaceOptions
                  }
                />
              </div>
            )}
          </section>
        </aside>
      </div>
      {tenant.isActive && (
        <section className="mt-6 rounded-2xl border border-red-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <UserX
                size={18}
              />
            </div>

            <div>
              <h2 className="font-semibold text-zinc-950">
                Deactivate tenant
              </h2>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
                Use this when the tenant is no longer part of your active rental records.
                Their leases, rent charges, payments, and financial history will remain preserved.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <DestructiveActionForm
              action={deactivateTenantAction.bind(
                null,
                tenant.id,
              )}
              confirmMessage={`Deactivate ${tenant.fullName}? Their lease and payment history will remain available.`}
              label="Deactivate tenant"
              pendingText="Deactivating..."
            />
          </div>
        </section>
      )}
    </div>
  );
}

function TenantInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </p>

      <p className="mt-1.5 text-sm font-medium text-zinc-900">
        {value}
      </p>
    </div>
  );
}