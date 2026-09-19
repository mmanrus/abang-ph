"use server";

import { requireUser } from "@/lib/auth/require-user";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

const allowedPropertyTypes = {
  BOARDING_HOUSE: "BOARDING_HOUSE",
  APARTMENT: "APARTMENT",
  DORMITORY: "DORMITORY",
  BEDSPACE: "BEDSPACE",
  HOUSE: "HOUSE",
  COMMERCIAL: "COMMERCIAL",
  OTHER: "OTHER",
} as const;

export async function completeOnboarding(
  formData: FormData,
) {
  const user = await requireUser();

  const existingLandlord =
    await prisma.landlordAccount.findUnique({
      where: {
        userId: user.id,
      },
    });

  if (existingLandlord) {
    redirect("/dashboard");
  }

  const displayName = String(
    formData.get("displayName") ?? "",
  ).trim();

  const phone = String(
    formData.get("phone") ?? "",
  ).trim();

  const propertyName = String(
    formData.get("propertyName") ?? "",
  ).trim();

  const propertyTypeInput = String(
    formData.get("propertyType") ?? "",
  );

  const city = String(
    formData.get("city") ?? "",
  ).trim();

  const province = String(
    formData.get("province") ?? "",
  ).trim();

  if (!displayName) {
    throw new Error("Business or landlord name is required.");
  }

  if (!propertyName) {
    throw new Error("Property name is required.");
  }

  const propertyType =
    allowedPropertyTypes[
      propertyTypeInput as keyof typeof allowedPropertyTypes
    ] ?? "BOARDING_HOUSE";

  await prisma.landlordAccount.create({
    data: {
      userId: user.id,

      displayName,

      phone: phone || null,

      timezone: "Asia/Manila",
      currency: "PHP",

      properties: {
        create: {
          name: propertyName,
          type: propertyType,

          city: city || null,
          province: province || null,
        },
      },
    },
  });

  redirect("/dashboard");
}