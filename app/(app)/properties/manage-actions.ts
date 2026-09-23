"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  ActionState,
} from "@/lib/action-state";

import {
  getUserSafeErrorMessage,
} from "@/lib/errors";

import {
  archiveProperty,
  archiveRentableSpace,
  archiveUnit,
  updateProperty,
  updateRentableSpace,
  updateUnit,
} from "@/server/services/property.service";
import { requireWritableLandlord } from "@/lib/auth/require-writable-landlord";

function optional(
  formData: FormData,
  key: string,
) {
  const value =
    String(
      formData.get(key) ?? "",
    ).trim();

  return value || null;
}

export async function updatePropertyAction(
  propertyId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state;
  const { landlord } =
    await requireWritableLandlord();

  try {
    await updateProperty({
      landlordAccountId:
        landlord.id,

      propertyId,

      name:
        String(
          formData.get("name") ?? "",
        ),

      type:
        String(
          formData.get("type") ??
          "OTHER",
        ) as
        | "BOARDING_HOUSE"
        | "APARTMENT"
        | "DORMITORY"
        | "BEDSPACE"
        | "HOUSE"
        | "COMMERCIAL"
        | "OTHER",

      addressLine1:
        optional(
          formData,
          "addressLine1",
        ),

      barangay:
        optional(
          formData,
          "barangay",
        ),

      city:
        optional(
          formData,
          "city",
        ),

      province:
        optional(
          formData,
          "province",
        ),

      postalCode:
        optional(
          formData,
          "postalCode",
        ),

      description:
        optional(
          formData,
          "description",
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
    "/properties",
  );

  revalidatePath(
    `/properties/${propertyId}`,
  );

  redirect(
    `/properties/${propertyId}?success=property-updated`,
  );
}

export async function archivePropertyAction(
  propertyId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;

  const { landlord } =
    await requireWritableLandlord();

  try {
    await archiveProperty({
      landlordAccountId:
        landlord.id,

      propertyId,
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
    "/properties",
  );

  redirect(
    "/properties?success=property-archived",
  );
}

export async function updateUnitAction(
  propertyId: string,
  unitId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { landlord } =
    await requireWritableLandlord();

  try {
    await updateUnit({
      landlordAccountId:
        landlord.id,

      propertyId,
      unitId,

      name:
        String(
          formData.get("name") ?? "",
        ),

      floor:
        optional(
          formData,
          "floor",
        ),

      description:
        optional(
          formData,
          "description",
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
    `/properties/${propertyId}`,
  );

  return {
    status: "success",
    message:
      "Room updated.",
  };
}

export async function archiveUnitAction(
  propertyId: string,
  unitId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;

  const { landlord } =
    await requireWritableLandlord();
  /**
   * BUSINESS INVARIANT
   * ------------------
   *
   * A room cannot disappear from active inventory while
   * somebody is still legally/operationally occupying one
   * of its spaces.
   *
   * Notice that we check LEASE records instead of trusting:
   *
   *   RentableSpace.status
   *
   * Why?
   *
   * status is a convenient cached state.
   *
   * Lease is the stronger historical/business record.
   *
   * If a bug ever caused:
   *
   *   Space.status = AVAILABLE
   *
   * while an ACTIVE Lease still existed,
   *
   * checking the lease protects us from destructive behavior.
   */
  try {
    await archiveUnit({
      landlordAccountId:
        landlord.id,

      propertyId,
      unitId,
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
    `/properties/${propertyId}`,
  );

  return {
    status: "success",

    message:
      "Room archived.",
  };
}

export async function updateSpaceAction(
  propertyId: string,
  unitId: string,
  spaceId: string,
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  void _state;

  const { landlord } =
    await requireWritableLandlord();

  try {
    await updateRentableSpace({
      landlordAccountId:
        landlord.id,

      propertyId,
      unitId,

      rentableSpaceId:
        spaceId,

      name:
        String(
          formData.get("name") ?? "",
        ),

      defaultRent:
        String(
          formData.get("defaultRent") ??
          "",
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
    `/properties/${propertyId}`,
  );

  return {
    status: "success",

    message:
      "Rental space updated.",
  };
}

export async function archiveSpaceAction(
  propertyId: string,
  unitId: string,
  spaceId: string,
  _state: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  void _state;
  void _formData;
  const { landlord } =
    await requireWritableLandlord();

  try {
    await archiveRentableSpace({
      landlordAccountId:
        landlord.id,

      propertyId,
      unitId,

      rentableSpaceId:
        spaceId,
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
    `/properties/${propertyId}`,
  );

  return {
    status: "success",

    message:
      "Rental space archived.",
  };
}