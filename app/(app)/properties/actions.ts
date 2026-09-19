"use server";

import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const propertyTypes = {
  BOARDING_HOUSE: "BOARDING_HOUSE",
  APARTMENT: "APARTMENT",
  DORMITORY: "DORMITORY",
  BEDSPACE: "BEDSPACE",
  HOUSE: "HOUSE",
  COMMERCIAL: "COMMERCIAL",
  OTHER: "OTHER",
} as const;

export async function createProperty(
  formData: FormData,
) {
  const { landlord } = await requireLandlord();

  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const typeInput = String(
    formData.get("type") ?? "",
  );

  const addressLine1 = String(
    formData.get("addressLine1") ?? "",
  ).trim();

  const barangay = String(
    formData.get("barangay") ?? "",
  ).trim();

  const city = String(
    formData.get("city") ?? "",
  ).trim();

  const province = String(
    formData.get("province") ?? "",
  ).trim();

  if (!name) {
    throw new Error(
      "Property name is required.",
    );
  }

  const type =
    propertyTypes[
      typeInput as keyof typeof propertyTypes
    ] ?? "BOARDING_HOUSE";

  const property =
    await prisma.property.create({
      data: {
        landlordAccountId: landlord.id,

        name,
        type,

        addressLine1:
          addressLine1 || null,

        barangay:
          barangay || null,

        city:
          city || null,

        province:
          province || null,
      },
    });

  redirect(`/properties/${property.id}`);
}

export async function createUnit(
  propertyId: string,
  formData: FormData,
) {
  const { landlord } =
    await requireLandlord();

  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const floor = String(
    formData.get("floor") ?? "",
  ).trim();

  if (!name) {
    throw new Error(
      "Unit or room name is required.",
    );
  }

  const property =
    await prisma.property.findFirst({
      where: {
        id: propertyId,
        landlordAccountId: landlord.id,
        deletedAt: null,
      },

      select: {
        id: true,
      },
    });

  if (!property) {
    throw new Error(
      "Property not found.",
    );
  }

  await prisma.unit.create({
    data: {
      propertyId: property.id,
      name,
      floor: floor || null,
    },
  });

  revalidatePath(
    `/properties/${propertyId}`,
  );
}

export async function createRentableSpace(
  propertyId: string,
  unitId: string,
  formData: FormData,
) {
  const { landlord } =
    await requireLandlord();

  const name = String(
    formData.get("name") ?? "",
  ).trim();

  const rentInput = String(
    formData.get("defaultRent") ?? "",
  ).trim();

  const rent = Number(rentInput);

  if (!name) {
    throw new Error(
      "Rentable space name is required.",
    );
  }

  if (
    !Number.isFinite(rent) ||
    rent < 0
  ) {
    throw new Error(
      "Enter a valid monthly rent.",
    );
  }

  const unit =
    await prisma.unit.findFirst({
      where: {
        id: unitId,
        propertyId,

        deletedAt: null,

        property: {
          landlordAccountId:
            landlord.id,

          deletedAt: null,
        },
      },

      select: {
        id: true,
      },
    });

  if (!unit) {
    throw new Error(
      "Unit not found.",
    );
  }

  await prisma.rentableSpace.create({
    data: {
      unitId: unit.id,

      name,

      defaultRent:
        rentInput || null,

      status: "AVAILABLE",
    },
  });

  revalidatePath(
    `/properties/${propertyId}`,
  );
}