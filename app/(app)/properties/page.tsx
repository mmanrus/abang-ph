import Link from "next/link";

import {
  Building2,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";

import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";
import { SuccessBanner } from "@/components/feedback/success-banner";
import type {
  Metadata,
} from "next";
import { SearchButton } from "@/components/forms/search-button";

export const metadata: Metadata = {
  title: "Properties",
};
type Props = {
  searchParams: Promise<{
    q?: string;
    success?: string;
  }>;
};

export default async function PropertiesPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  /**
   * URL SEARCH INPUT
   * ----------------
   *
   * Example:
   *
   * /properties?q=Rusiana
   *
   * Search parameters come from the browser,
   * so we normalize them before using them.
   *
   * trim() means:
   *
   *   "   Rusiana   "
   *
   * becomes:
   *
   *   "Rusiana"
   */
  const q =
    params.q?.trim() ?? "";


  const { landlord } =
    await requireLandlord();

  const properties =
    await prisma.property.findMany({
      where: {
        /**
       * DATA ISOLATION
       * --------------
       *
       * Search NEVER removes our landlord boundary.
       *
       * Even if somebody manually changes:
       *
       * ?q=something
       *
       * this query can only search properties owned by
       * the authenticated landlord.
       */
        landlordAccountId: landlord.id,
        deletedAt: null,
        isActive: true,
        /**
       * Only add the OR search conditions when there
       * is actually a search term.
       *
       * If q === "":
       *
       * show all active landlord properties.
       */
        ...(q ? {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive"
              }
            }
          ]
        } : {})
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
      <SuccessBanner
        code={
          params.success
        }
      />
      <form
        method="GET"
        className="mt-6"
      >
        <div className="flex max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, barangay, city, province..."
              className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <SearchButton
            className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Search
          </SearchButton>

          {q && (
            <Link
              href="/properties"
              aria-label="Clear search"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
            >
              <X size={17} />
            </Link>
          )}
        </div>
      </form>
      {q && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <span>
            {properties.length}{" "}
            {properties.length === 1
              ? "property"
              : "properties"}{" "}
            found for
          </span>

          <span className="rounded-lg bg-zinc-100 px-2 py-1 font-medium text-zinc-700">
            &quot;{q}&quot;
          </span>
        </div>
      )}
      {properties.length === 0 ? (
        q ? (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <Search
              size={36}
              className="mx-auto text-zinc-400"
            />

            <h2 className="mt-4 font-semibold text-zinc-950">
              No properties found
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              No property matches{" "}
              <span className="font-medium text-zinc-700">
                &quot;{q}&quot;
              </span>
              .
            </p>

            <Link
              href="/properties"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <X size={16} />

              Clear search
            </Link>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <Building2
              size={38}
              className="mx-auto text-zinc-400"
            />

            <h2 className="mt-4 font-semibold text-zinc-950">
              No properties yet
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Add your first rental property to start managing rooms and tenants.
            </p>

            <Link
              href="/properties/new"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={17} />

              Add property
            </Link>
          </div>
        )
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