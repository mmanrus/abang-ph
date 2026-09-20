"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";

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
  updateBusinessProfile,
} from "@/server/services/settings.service";

export async function updateBusinessProfileAction(
  _previousState:
    ActionState,

  formData:
    FormData,
): Promise<ActionState> {
  /**
   * AUTHORIZATION
   *
   * landlord.id comes from the authenticated session.
   *
   * We intentionally do NOT read landlordAccountId
   * from FormData.
   */
  const {
    landlord,
  } =
    await requireLandlord();

  try {
    await updateBusinessProfile({
      landlordAccountId:
        landlord.id,

      displayName:
        String(
          formData.get(
            "displayName",
          ) ?? "",
        ),

      phone:
        String(
          formData.get(
            "phone",
          ) ?? "",
        ),

      timezone:
        String(
          formData.get(
            "timezone",
          ) ?? "",
        ),

      currency:
        String(
          formData.get(
            "currency",
          ) ?? "",
        ),
    });
  } catch (error) {
    return {
      status:
        "error",

      message:
        getUserSafeErrorMessage(
          error,
        ),
    };
  }

  /**
   * Business name appears in our shared application shell,
   * so revalidate the major authenticated area.
   */
  revalidatePath(
    "/dashboard",
    "layout",
  );

  revalidatePath(
    "/settings",
  );

  redirect(
    "/settings?success=settings-updated",
  );
}