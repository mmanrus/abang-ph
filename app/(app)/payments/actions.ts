"use server";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  voidPayment,
} from "@/server/services/payment.service";

import {
  revalidatePath,
} from "next/cache";
import {
  recordRentPayment,
} from "@/server/services/rent.service";

import {
  randomUUID,
} from "node:crypto";
import {
  redirect,
} from "next/navigation";
import {
  AppError,
} from "@/lib/errors";
import { requireWritableLandlord } from "@/lib/auth/require-writable-landlord";

export async function voidPaymentAction(
  paymentId: string,
  formData: FormData,
) {
  /**
   * SECURITY:
   *
   * The authenticated session determines which landlord
   * is allowed to perform this operation.
   *
   * We do NOT receive landlordAccountId from the form.
   */
  const { landlord } =
    await requireWritableLandlord();

  const reason =
    String(
      formData.get(
        "reason",
      ) ?? "",
    ).trim();

  await voidPayment({
    landlordAccountId:
      landlord.id,

    paymentId,

    reason,
  });

  /**
   * Because payment values affect multiple screens,
   * invalidate all pages that display those totals.
   */
  revalidatePath(
    "/payments",
  );

  revalidatePath(
    `/payments/${paymentId}`,
  );

  revalidatePath(
    "/rent",
  );

  revalidatePath(
    "/dashboard",
  );

  redirect(
    `/payments/${paymentId}?success=payment-voided`,
  );
}

const paymentMethods = {
  CASH: "CASH",
  GCASH: "GCASH",
  MAYA: "MAYA",
  BANK_TRANSFER: "BANK_TRANSFER",
  OTHER: "OTHER",
} as const;

type AllocationPayload = {
  rentChargeId: string;
  amount: string;
};

function parsePaymentDate(
  value: string,
) {
  const date =
    new Date(
      `${value}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new AppError(
      "Invalid payment date.",
    );
  }

  return date;
}

export async function recordMultiChargePayment(
  formData: FormData,
) {
  /**
   * SECURITY:
   *
   * Never accept landlordAccountId from FormData.
   *
   * The session is the trusted source.
   */
  const { landlord } =
    await requireWritableLandlord();

  const tenantId =
    String(
      formData.get(
        "tenantId",
      ) ?? "",
    ).trim();

  const amount =
    String(
      formData.get(
        "amount",
      ) ?? "",
    ).trim();

  const paidAt =
    String(
      formData.get(
        "paidAt",
      ) ?? "",
    ).trim();

  const methodInput =
    String(
      formData.get(
        "method",
      ) ?? "",
    ).trim();

  const referenceNumber =
    String(
      formData.get(
        "referenceNumber",
      ) ?? "",
    ).trim();

  const notes =
    String(
      formData.get(
        "notes",
      ) ?? "",
    ).trim();

  const allocationsJson =
    String(
      formData.get(
        "allocations",
      ) ?? "",
    );

  const idempotencyKey =
    String(
      formData.get(
        "idempotencyKey",
      ) ??
      randomUUID(),
    );

  if (!tenantId) {
    throw new AppError(
      "Tenant is required.",
    );
  }

  const method =
    paymentMethods[
    methodInput as keyof typeof paymentMethods
    ];

  if (!method) {
    throw new AppError(
      "Invalid payment method.",
    );
  }

  let allocations:
    AllocationPayload[];

  try {
    allocations =
      JSON.parse(
        allocationsJson,
      );
  } catch {
    throw new AppError(
      "Invalid payment allocations.",
    );
  }

  if (
    !Array.isArray(
      allocations,
    ) ||
    allocations.length === 0
  ) {
    throw new AppError(
      "Select at least one rent charge.",
    );
  }

  /**
   * IMPORTANT:
   *
   * The browser sends amounts, but we still do NOT trust them.
   *
   * recordRentPayment() re-checks:
   *
   * - tenant ownership
   * - rent charge ownership
   * - remaining balance
   * - payment total
   * - allocation total
   * - overpayment
   *
   * Client validation = good UX
   * Server validation = security
   */
  const payment =
    await recordRentPayment({
      landlordAccountId:
        landlord.id,

      tenantId,

      amount,

      method,

      paidAt:
        parsePaymentDate(
          paidAt,
        ),

      referenceNumber:
        referenceNumber ||
        null,

      notes:
        notes || null,

      idempotencyKey,

      allocations,
    });

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    "/rent",
  );

  revalidatePath(
    "/payments",
  );

  revalidatePath(
    `/tenants/${tenantId}`,
  );

  redirect(
    `/payments/${payment.id}?success=payment-recorded`,
  );
}