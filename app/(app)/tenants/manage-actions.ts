"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  ActionState,
} from "@/lib/action-state";

import {
  getUserSafeErrorMessage,
} from "@/lib/errors";

import {
  deactivateTenant,
  updateTenant,
} from "@/server/services/tenant.service";

function optional(
  formData: FormData,
  key: string,
) {
  return (
    String(
      formData.get(key) ?? "",
    ).trim() || null
  );
}

export async function updateTenantAction(
  tenantId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const { landlord } =
    await requireLandlord();

  try {
    await updateTenant({
      landlordAccountId:
        landlord.id,

      tenantId,

      fullName:
        String(
          formData.get(
            "fullName",
          ) ?? "",
        ),

      phone:
        optional(
          formData,
          "phone",
        ),

      email:
        optional(
          formData,
          "email",
        ),

      emergencyContactName:
        optional(
          formData,
          "emergencyContactName",
        ),

      emergencyContactPhone:
        optional(
          formData,
          "emergencyContactPhone",
        ),

      notes:
        optional(
          formData,
          "notes",
        ),
    });
  } catch (error) {
    return {
      status: "error",

      message:
        getUserSafeErrorMessage(
          error,
        ),
    };
  }

  revalidatePath(
    "/tenants",
  );

  revalidatePath(
    `/tenants/${tenantId}`,
  );

  redirect(
    `/tenants/${tenantId}?success=tenant-updated`,
  );
}

export async function deactivateTenantAction(
  tenantId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;
  const { landlord } =
    await requireLandlord();

  try {
    await deactivateTenant({
      landlordAccountId:
        landlord.id,

      tenantId,
    });
  } catch (error) {
    return {
      status: "error",

      message:
        getUserSafeErrorMessage(
          error,
        ),
    };
  }

  revalidatePath(
    "/tenants",
  );

  revalidatePath(
    `/tenants/${tenantId}`,
  );

  return {
    status: "success",

    message:
      "Tenant deactivated.",
  };
}