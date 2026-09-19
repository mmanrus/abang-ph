"use server";

import {
  getCurrentManilaPeriod,
} from "@/lib/billing-date";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  generateRentChargesForPeriod,
  recordRentPayment,
} from "@/server/services/rent.service";

import {
  revalidatePath,
} from "next/cache";

const paymentMethods = {
  CASH: "CASH",
  GCASH: "GCASH",
  MAYA: "MAYA",
  BANK_TRANSFER: "BANK_TRANSFER",
  OTHER: "OTHER",
} as const;

function parseDateInput(
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
    throw new Error(
      "Invalid payment date.",
    );
  }

  return date;
}

export async function generateCurrentRentCharges() {
  const { landlord } =
    await requireLandlord();

  const {
    year,
    month,
  } =
    getCurrentManilaPeriod();

  await generateRentChargesForPeriod({
    landlordAccountId:
      landlord.id,

    year,
    month,
  });

  revalidatePath(
    "/rent",
  );

  revalidatePath(
    "/dashboard",
  );
}

export async function recordChargePayment(
  rentChargeId: string,
  formData: FormData,
) {
  const { landlord } =
    await requireLandlord();

  const charge =
    await prisma.rentCharge.findFirst({
      where: {
        id: rentChargeId,

        deletedAt: null,

        lease: {
          is: {
            tenant: {
              is: {
                landlordAccountId:
                  landlord.id,
              },
            },
          },
        },
      },

      select: {
        id: true,

        lease: {
          select: {
            tenantId: true,
          },
        },
      },
    });

  if (!charge) {
    throw new Error(
      "Rent charge not found.",
    );
  }

  const amount =
    String(
      formData.get(
        "amount",
      ) ?? "",
    ).trim();

  const methodInput =
    String(
      formData.get(
        "method",
      ) ?? "",
    );

  const method =
    paymentMethods[
      methodInput as keyof typeof paymentMethods
    ];

  if (!method) {
    throw new Error(
      "Invalid payment method.",
    );
  }

  const paidAtInput =
    String(
      formData.get(
        "paidAt",
      ) ?? "",
    );

  const idempotencyKey =
    String(
      formData.get(
        "idempotencyKey",
      ) ?? "",
    );

  if (!idempotencyKey) {
    throw new Error(
      "Missing payment idempotency key.",
    );
  }

  await recordRentPayment({
    landlordAccountId:
      landlord.id,

    tenantId:
      charge.lease.tenantId,

    amount,

    method,

    paidAt:
      parseDateInput(
        paidAtInput,
      ),

    referenceNumber:
      String(
        formData.get(
          "referenceNumber",
        ) ?? "",
      ).trim() ||
      null,

    notes:
      String(
        formData.get(
          "notes",
        ) ?? "",
      ).trim() ||
      null,

    idempotencyKey,

    allocations: [
      {
        rentChargeId:
          charge.id,

        amount,
      },
    ],
  });

  revalidatePath(
    "/rent",
  );

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    `/tenants/${charge.lease.tenantId}`,
  );
}