"use server";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  searchPropertyPicker,
  searchTenantPicker,
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