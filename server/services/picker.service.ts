import "server-only";

import type {
  Prisma,
} from "@/generated/prisma/client";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  PICKER_PAGE_SIZE,
  type PickerResult,
} from "@/lib/picker";

import {
  getSkip,
  getTotalPages,
} from "@/lib/pagination";

/**
 * PickerService
 * -------------
 *
 * Provides small, paginated datasets for entity-selection
 * modals.
 *
 * IMPORTANT:
 *
 * We never load every property or tenant and then search in
 * React.
 *
 * Search + pagination happens in PostgreSQL.
 */

function normalizePage(
  page: number,
) {
  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

function normalizeSearch(
  value: string,
) {
  /**
   * Limit search input length before sending it into
   * database queries.
   *
   * This is mostly defensive input hygiene.
   */
  return value
    .trim()
    .slice(
      0,
      100,
    );
}

export async function searchPropertyPicker({
  landlordAccountId,
  q,
  page,
}: {
  landlordAccountId:
    string;

  q: string;

  page: number;
}): Promise<PickerResult> {
  const search =
    normalizeSearch(q);

  const requestedPage =
    normalizePage(page);

  const where = {
    /**
     * DATA ISOLATION:
     *
     * The picker can only return properties belonging to
     * the authenticated landlord.
     */
    landlordAccountId,

    deletedAt:
      null,

    isActive:
      true,

    ...(search
      ? {
          OR: [
            {
              name: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              addressLine1: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              barangay: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              city: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              province: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.PropertyWhereInput;

  const totalItems =
    await prisma.property.count({
      where,
    });

  const totalPages =
    getTotalPages(
      totalItems,
      PICKER_PAGE_SIZE,
    );

  const safePage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const properties =
    await prisma.property.findMany({
      where,

      skip:
        getSkip(
          safePage,
          PICKER_PAGE_SIZE,
        ),

      take:
        PICKER_PAGE_SIZE,

      orderBy: [
        {
          name:
            "asc",
        },

        {
          id:
            "asc",
        },
      ],

      select: {
        id: true,
        name: true,

        barangay:
          true,

        city:
          true,

        province:
          true,

        units: {
          where: {
            deletedAt:
              null,
          },

          select: {
            rentableSpaces: {
              where: {
                deletedAt:
                  null,
              },

              select: {
                status:
                  true,
              },
            },
          },
        },
      },
    });

  return {
    page:
      safePage,

    totalPages,

    totalItems,

    items:
      properties.map(
        (property) => {
          let spaces = 0;
          let occupied = 0;

          for (
            const unit of
            property.units
          ) {
            spaces +=
              unit.rentableSpaces.length;

            occupied +=
              unit.rentableSpaces.filter(
                (space) =>
                  space.status ===
                  "OCCUPIED",
              ).length;
          }

          const location = [
            property.barangay,
            property.city,
            property.province,
          ]
            .filter(Boolean)
            .join(", ");

          return {
            id:
              property.id,

            title:
              property.name,

            subtitle:
              location ||
              "No location provided",

            details: [
              `${property.units.length} ${
                property.units.length === 1
                  ? "room"
                  : "rooms"
              }`,

              `${spaces} ${
                spaces === 1
                  ? "space"
                  : "spaces"
              }`,

              `${occupied} occupied`,
            ],
          };
        },
      ),
  };
}

export async function searchTenantPicker({
  landlordAccountId,
  q,
  page,
}: {
  landlordAccountId:
    string;

  q: string;

  page: number;
}): Promise<PickerResult> {
  const search =
    normalizeSearch(q);

  const requestedPage =
    normalizePage(page);

  const where = {
    landlordAccountId,

    deletedAt:
      null,

    ...(search
      ? {
          OR: [
            {
              fullName: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              phone: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },

            {
              email: {
                contains:
                  search,

                mode:
                  "insensitive",
              },
            },
          ],
        }
      : {}),
  } satisfies Prisma.TenantWhereInput;

  const totalItems =
    await prisma.tenant.count({
      where,
    });

  const totalPages =
    getTotalPages(
      totalItems,
      PICKER_PAGE_SIZE,
    );

  const safePage =
    Math.min(
      requestedPage,
      totalPages,
    );

  const tenants =
    await prisma.tenant.findMany({
      where,

      skip:
        getSkip(
          safePage,
          PICKER_PAGE_SIZE,
        ),

      take:
        PICKER_PAGE_SIZE,

      orderBy: [
        {
          isActive:
            "desc",
        },

        {
          fullName:
            "asc",
        },

        {
          id:
            "asc",
        },
      ],

      select: {
        id: true,

        fullName:
          true,

        phone: true,
        email: true,

        isActive:
          true,

        leases: {
          where: {
            status:
              "ACTIVE",

            deletedAt:
              null,
          },

          take: 1,

          select: {
            rentableSpace: {
              select: {
                name: true,

                unit: {
                  select: {
                    name:
                      true,

                    property: {
                      select: {
                        name:
                          true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

  return {
    page:
      safePage,

    totalPages,

    totalItems,

    items:
      tenants.map(
        (tenant) => {
          const lease =
            tenant.leases[0];

          const leaseDescription =
            lease
              ? [
                  lease
                    .rentableSpace
                    .unit
                    .property
                    .name,

                  lease
                    .rentableSpace
                    .unit
                    .name,

                  lease
                    .rentableSpace
                    .name,
                ].join(
                  " · ",
                )
              : "No active lease";

          return {
            id:
              tenant.id,

            title:
              tenant.fullName,

            subtitle:
              tenant.phone ||
              tenant.email ||
              "No contact information",

            details: [
              leaseDescription,
            ],

            badge:
              tenant.isActive
                ? "ACTIVE"
                : "INACTIVE",
          };
        },
      ),
  };
}