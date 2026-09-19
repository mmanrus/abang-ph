import Link from "next/link";

import {
  ArrowLeft,
  BedDouble,
  Building2,
} from "lucide-react";

import { notFound } from "next/navigation";

import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";

import {
  createRentableSpace,
  createUnit,
} from "../actions";

type Props = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function PropertyPage({
  params,
}: Props) {
  const { propertyId } = await params;

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

      <div className="mt-5 flex items-start gap-4">
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
              .join(", ") ||
              "No address added"}
          </p>
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
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            name="name"
            required
            placeholder="Room 101"
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />

          <input
            name="floor"
            placeholder="Floor"
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            className="rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
          >
            Add room
          </button>
        </form>
      </section>

      {/* ROOMS */}
      <div className="mt-6 space-y-4">
        {property.units.map(
          (unit) => (
            <section
              key={unit.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm"
            >
              <div className="border-b border-zinc-100 px-5 py-4">
                <h2 className="font-semibold text-zinc-950">
                  {unit.name}
                </h2>

                {unit.floor && (
                  <p className="mt-1 text-xs text-zinc-500">
                    {unit.floor}
                  </p>
                )}
              </div>

              <div className="p-5">
                {unit.rentableSpaces
                  .length === 0 ? (
                  <p className="text-sm text-zinc-500">
                    No rentable spaces yet.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {unit.rentableSpaces.map(
                      (space) => (
                        <div
                          key={space.id}
                          className="rounded-xl border border-zinc-200 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <BedDouble
                              size={19}
                              className="text-zinc-500"
                            />

                            <p className="font-medium text-zinc-950">
                              {space.name}
                            </p>
                          </div>

                          <p className="mt-3 text-lg font-semibold text-zinc-950">
                            {space.defaultRent
                              ? `₱${Number(
                                  space.defaultRent,
                                ).toLocaleString(
                                  "en-PH",
                                )}`
                              : "No rent set"}
                          </p>

                          <span
                            className={[
                              "mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                              space.status ===
                              "OCCUPIED"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-zinc-100 text-zinc-600",
                            ].join(
                              " ",
                            )}
                          >
                            {space.status}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <form
                  action={createRentableSpace.bind(
                    null,
                    property.id,
                    unit.id,
                  )}
                  className="mt-5 grid gap-3 border-t border-zinc-100 pt-5 sm:grid-cols-[1fr_180px_auto]"
                >
                  <input
                    name="name"
                    required
                    placeholder="Bed A / Entire Unit"
                    className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <input
                    name="defaultRent"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="Monthly rent"
                    className="rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  />

                  <button
                    type="submit"
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    Add space
                  </button>
                </form>
              </div>
            </section>
          ),
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