"use server";

import {
  createActiveLease,
  endActiveLease,
} from "@/server/services/lease.service";

import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";
import { requireWritableLandlord } from "@/lib/auth/require-writable-landlord";

function readOptionalString(
  formData: FormData,
  key: string,
) {
  const value = String(
    formData.get(key) ?? "",
  ).trim();

  return value || null;
}

function parseDateInput(
  value: string,
) {
  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new Error(
      "Invalid date.",
    );
  }

  return date;
}

export async function createTenant(
  formData: FormData,
) {
  const { landlord } =
    await requireWritableLandlord();

  const fullName = String(
    formData.get("fullName") ?? "",
  ).trim();

  if (!fullName) {
    throw new Error(
      "Tenant name is required.",
    );
  }

  const tenant =
    await prisma.tenant.create({
      data: {
        landlordAccountId:
          landlord.id,

        fullName,

        phone:
          readOptionalString(
            formData,
            "phone",
          ),

        email:
          readOptionalString(
            formData,
            "email",
          ),

        emergencyContactName:
          readOptionalString(
            formData,
            "emergencyContactName",
          ),

        emergencyContactPhone:
          readOptionalString(
            formData,
            "emergencyContactPhone",
          ),

        notes:
          readOptionalString(
            formData,
            "notes",
          ),

        isActive: true,
      },
    });

  redirect(
    `/tenants/${tenant.id}`,
  );
}

export async function createLeaseAction(
  tenantId: string,
  formData: FormData,
) {
  const { landlord } =
    await requireWritableLandlord();

  const rentableSpaceId =
    String(
      formData.get(
        "rentableSpaceId",
      ) ?? "",
    );

  const monthlyRent =
    String(
      formData.get(
        "monthlyRent",
      ) ?? "",
    ).trim();

  const securityDeposit =
    String(
      formData.get(
        "securityDeposit",
      ) ?? "",
    ).trim();

  const dueDay = Number(
    formData.get("dueDay"),
  );

  const startDateInput =
    String(
      formData.get(
        "startDate",
      ) ?? "",
    );

  const endDateInput =
    String(
      formData.get(
        "endDate",
      ) ?? "",
    );

  const notes =
    readOptionalString(
      formData,
      "notes",
    );

  if (!rentableSpaceId) {
    throw new Error(
      "Select a rentable space.",
    );
  }

  if (!startDateInput) {
    throw new Error(
      "Start date is required.",
    );
  }

  await createActiveLease({
    landlordAccountId:
      landlord.id,

    tenantId,

    rentableSpaceId,

    monthlyRent,

    securityDeposit:
      securityDeposit || null,

    dueDay,

    startDate:
      parseDateInput(
        startDateInput,
      ),

    endDate:
      endDateInput
        ? parseDateInput(
            endDateInput,
          )
        : null,

    notes,
  });

  revalidatePath(
    `/tenants/${tenantId}`,
  );

  revalidatePath(
    "/tenants",
  );

  revalidatePath(
    "/properties",
  );

  redirect(
    `/tenants/${tenantId}`,
  );
}

export async function endLeaseAction(
  tenantId: string,
  leaseId: string,
) {
  const { landlord } =
    await requireWritableLandlord();

  await endActiveLease({
    landlordAccountId:
      landlord.id,

    leaseId,
  });

  revalidatePath(
    `/tenants/${tenantId}`,
  );

  revalidatePath(
    "/tenants",
  );

  revalidatePath(
    "/properties",
  );

  revalidatePath(
    "/dashboard",
  );
}