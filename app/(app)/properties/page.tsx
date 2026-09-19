import Link from "next/link";

import {
  Building2,
  ChevronRight,
  Plus,
} from "lucide-react";

import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";

export default async function PropertiesPage() {
  const { landlord } =
    await requireLandlord();

  const properties =
    await prisma.property.findMany({
      where: {
        landlordAccountId: landlord.id,
        deletedAt: null,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        units: {
          where: {
            deletedAt: null,
          },

          include: {
            rentableSpaces: {
              where: {
                deletedAt: null,
              },

              select: {
                id: true,
                status: true,
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
            Properties
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            Manage your rental properties,
            rooms, and rentable spaces.
          </p>
        </div>

        <Link
          href="/properties/new"
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          <Plus size={18} />

          <span className="hidden sm:inline">
            Add property
          </span>
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
          <Building2
            className="mx-auto text-zinc-400"
            size={36}
          />

          <h2 className="mt-4 font-semibold text-zinc-950">
            No properties yet
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Add your first rental property.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {properties.map(
            (property) => {
              const spaces =
                property.units.flatMap(
                  (unit) =>
                    unit.rentableSpaces,
                );

              const occupied =
                spaces.filter(
                  (space) =>
                    space.status ===
                    "OCCUPIED",
                ).length;

              return (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Building2 size={21} />
                    </div>

                    <ChevronRight
                      size={20}
                      className="text-zinc-400 transition group-hover:translate-x-1"
                    />
                  </div>

                  <h2 className="mt-5 text-lg font-semibold text-zinc-950">
                    {property.name}
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    {[
                      property.city,
                      property.province,
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                      "No address added"}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4">
                    <PropertyMetric
                      label="Rooms"
                      value={
                        property.units
                          .length
                      }
                    />

                    <PropertyMetric
                      label="Spaces"
                      value={
                        spaces.length
                      }
                    />

                    <PropertyMetric
                      label="Occupied"
                      value={occupied}
                    />
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

function PropertyMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-lg font-semibold text-zinc-950">
        {value}
      </p>

      <p className="text-xs text-zinc-500">
        {label}
      </p>
    </div>
  );
}