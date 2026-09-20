import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  Building2,
} from "lucide-react";

import { notFound } from "next/navigation";
import {
  SuccessBanner,
} from "@/components/feedback/success-banner";

import { DestructiveActionForm } from "@/components/forms/destructive-action-form";
import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";
import {
  UnitManagementCard,
} from "@/components/properties/unit-management-card";

import {
  archivePropertyAction,
} from "../manage-actions";
import {
  SubmitButton,
} from "@/components/forms/submit-button";

import {
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/lib/ui-classes";

import {
  createRentableSpace,
  createUnit,
} from "../actions";

type Props = {
  params: Promise<{
    propertyId: string;
  }>;

  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function PropertyPage({
  params,
  searchParams,
}: Props) {
  const {
    propertyId,
  } =
    await params;

  const query =
    await searchParams;

  const { landlord } =
    await requireLandlord();

  const property =
    await prisma.property.findFirst({
      where: {
        id: propertyId,

        landlordAccountId:
          landlord.id,

        deletedAt: null,
      },

      include: {
        units: {
          where: {
            deletedAt: null,
          },

          orderBy: {
            createdAt: "asc",
          },

          include: {
            rentableSpaces: {
              where: {
                deletedAt: null,
              },

              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
      },
    });

  if (!property) {
    notFound();
  }

  const spaces =
    property.units.flatMap(
      (unit) =>
        unit.rentableSpaces,
    );

  const occupied =
    spaces.filter(
      (space) =>
        space.status === "OCCUPIED",
    ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft size={17} />
        Properties
      </Link>
      <SuccessBanner
        code={
          query.success
        }
      />
      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <Building2 size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
              {property.name}
            </h1>

            <p className="mt-1 text-sm text-zinc-500">
              {[
                property.addressLine1,
                property.barangay,
                property.city,
                property.province,
              ]
                .filter(Boolean)
                .join(", ") || "No address added"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/properties/${property.id}/edit`}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Edit property
          </Link>

          <DestructiveActionForm
            action={archivePropertyAction.bind(
              null,
              property.id,
            )}
            confirmMessage="Archive this property? Its historical leases, payments, expenses, and rent records will be preserved."
            label="Archive property"
            pendingText="Archiving..."
          />
        </div>
      </div>

      <div className="mt-7 grid grid-cols-3 gap-3">
        <Metric
          label="Rooms / Units"
          value={property.units.length}
        />

        <Metric
          label="Rentable spaces"
          value={spaces.length}
        />

        <Metric
          label="Occupied"
          value={occupied}
        />
      </div>

      {/* ADD ROOM */}
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-950">
          Add room or unit
        </h2>
        <form
          action={createUnit.bind(
            null,
            property.id,
          )}
          className="grid gap-3 sm:grid-cols-[1fr_180px_auto]"
        >
          <div>
            <label
              htmlFor="new-unit-name"
              className="sr-only"
            >
              Room or unit name
            </label>

            <input
              id="new-unit-name"
              name="name"
              required
              placeholder="Room 101"
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="new-unit-floor"
              className="sr-only"
            >
              Floor
            </label>

            <input
              id="new-unit-floor"
              name="floor"
              placeholder="1st Floor"
              className={inputClass}
            />
          </div>

          <SubmitButton
            pendingText="Adding..."
            className={
              primaryButtonClass
            }
          >
            Add room
          </SubmitButton>
        </form>
      </section>

      {/* ROOMS */}
      <div className="mt-6 space-y-4">
        {property.units.length ===
          0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <p className="font-medium text-zinc-900">
              No rooms or units yet
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Add the first room or unit above.
            </p>
          </div>
        ) : (
          property.units.map(
            (unit) => (
              <UnitManagementCard
                key={
                  unit.id
                }
                propertyId={
                  property.id
                }
                unit={{
                  id:
                    unit.id,

                  name:
                    unit.name,

                  floor:
                    unit.floor,

                  description:
                    unit.description,

                  /**
                   * Server → Client boundary
                   *
                   * Prisma Decimal is a special object.
                   *
                   * Convert it to a plain string before
                   * passing it to a Client Component.
                   */
                  rentableSpaces:
                    unit.rentableSpaces.map(
                      (space) => ({
                        id:
                          space.id,

                        name:
                          space.name,

                        defaultRent:
                          space.defaultRent?.toString() ??
                          null,

                        status:
                          space.status,
                      }),
                    ),
                }}
                addSpaceForm={
                  <AddSpaceForm
                    propertyId={
                      property.id
                    }
                    unitId={
                      unit.id
                    }
                  />
                }
              />
            ),
          )
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xl font-semibold text-zinc-950">
        {value}
      </p>

      <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}
function AddSpaceForm({
  propertyId,
  unitId,
}: {
  propertyId: string;
  unitId: string;
}) {
  return (
    <details>
      <summary className="cursor-pointer rounded-lg text-sm font-medium text-emerald-700 outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20">
        + Add rental space
      </summary>

      <form
        action={createRentableSpace.bind(
          null,
          propertyId,
          unitId,
        )}
        className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
      >
        <div>
          <label
            htmlFor={`space-name-${unitId}`}
            className="sr-only"
          >
            Rental space name
          </label>

          <input
            id={`space-name-${unitId}`}
            name="name"
            required
            placeholder="Bed A / Entire Unit"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor={`space-rent-${unitId}`}
            className="sr-only"
          >
            Default monthly rent
          </label>

          <input
            id={`space-rent-${unitId}`}
            name="defaultRent"
            type="number"
            min="0"
            step="0.01"
            required
            placeholder="Monthly rent"
            className={inputClass}
          />
        </div>

        <SubmitButton
          pendingText="Adding..."
          className={
            secondaryButtonClass
          }
        >
          Add space
        </SubmitButton>
      </form>
    </details>
  );
}