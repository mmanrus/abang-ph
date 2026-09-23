"use server";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  searchPropertyPicker,
  searchTenantPicker,
  searchRentableSpacePicker,
} from "@/server/services/picker.service";

type PickerRequest = {
  q: string;
  page: number;
};

/**
 * SECURITY:
 *
 * There is deliberately no landlordAccountId argument.
 *
 * The landlord scope comes from the authenticated session.
 */
export async function searchPropertyPickerAction(
  input:
    PickerRequest,
) {
  const {
    landlord,
  } =
    await requireLandlord();

  return searchPropertyPicker({
    landlordAccountId:
      landlord.id,

    q:
      input.q,

    page:
      input.page,
  });
}

export async function searchTenantPickerAction(
  input:
    PickerRequest,
) {
  const {
    landlord,
  } =
    await requireLandlord();

  return searchTenantPicker({
    landlordAccountId:
      landlord.id,

    q:
      input.q,

    page:
      input.page,
  });
}


/**
 * SECURITY:
 *
 * Same pattern as above -- landlordAccountId comes from the
 * authenticated session, never from the client. propertyId IS
 * a client-supplied argument (the landlord picked it in step 1
 * of the lease-creation picker), so searchRentableSpacePicker
 * re-verifies that property actually belongs to this landlord
 * before returning any of its spaces.
 */
export async function searchRentableSpacePickerAction(
  input:
    PickerRequest & {
      propertyId:
        string;
    },
) {
  const {
    landlord,
  } =
    await requireLandlord();
 
  return searchRentableSpacePicker({
    landlordAccountId:
      landlord.id,
 
    propertyId:
      input.propertyId,
 
    q:
      input.q,
 
    page:
      input.page,
  });
}