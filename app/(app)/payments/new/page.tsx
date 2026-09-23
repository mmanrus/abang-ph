import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  randomUUID,
} from "node:crypto";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  EntityPickerField,
} from "@/components/pickers/entity-picker-field";
import {
  getManilaToday,
} from "@/lib/billing-date";

import {
  getOutstandingChargesForTenant,
} from "@/server/services/payment.service";

import {
  MultiChargePaymentForm,
} from "@/components/payments/multi-charge-payment-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { secondaryButtonClass } from "@/lib/ui-classes";
import { requireWritableLandlord } from "@/lib/auth/require-writable-landlord";

type Props = {
  searchParams: Promise<{
    tenantId?: string;
  }>;
};

function dateInputValue() {
  const date =
    getManilaToday();

  return [
    date.getUTCFullYear(),

    String(
      date.getUTCMonth() +
      1,
    ).padStart(
      2,
      "0",
    ),

    String(
      date.getUTCDate(),
    ).padStart(
      2,
      "0",
    ),
  ].join("-");
}

export default async function NewPaymentPage({
  searchParams,
}: Props) {
  const {
    tenantId,
  } =
    await searchParams;

  const { landlord } =
    await requireWritableLandlord();
  let selected:
    Awaited<
      ReturnType<
        typeof getOutstandingChargesForTenant
      >
    > | null = null;

  if (tenantId) {
    try {
      selected =
        await getOutstandingChargesForTenant({
          landlordAccountId:
            landlord.id,

          tenantId,
        });
    } catch {
      selected =
        null;
    }
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/payments"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft
          size={17}
        />

        Payments
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Record payment
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Record one payment and allocate it across one or more outstanding rent charges.
        </p>
      </div>

      <section className="mt-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold text-zinc-950">
          Tenant
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Select the tenant whose outstanding rent you want to load.
        </p>

        <form
          method="GET"
          className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="min-w-0 flex-1">
            <EntityPickerField
              kind="tenant"
              name="tenantId"
              label="Tenant"
              placeholder="Select tenant"
              searchPlaceholder="Search tenant name, phone, or email..."
              initialSelection={
                selected
                  ? {
                    id:
                      selected.tenant.id,

                    title:
                      selected.tenant.fullName,

                    subtitle:
                      "Selected tenant",
                  }
                  : null
              }
            />
          </div>

          <SubmitButton
            className={secondaryButtonClass}
          >
            Load balance
          </SubmitButton>
        </form>
      </section>

      {selected && (
        <div className="mt-6">
          <div className="mb-4">
            <p className="text-sm text-zinc-500">
              Recording payment for
            </p>

            <h2 className="mt-1 text-xl font-semibold text-zinc-950">
              {
                selected.tenant
                  .fullName
              }
            </h2>
          </div>

          {selected.charges.length ===
            0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
              <p className="font-medium text-zinc-950">
                No outstanding rent
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                This tenant currently has no unpaid rent charges.
              </p>
            </div>
          ) : (
            <MultiChargePaymentForm
              tenantId={
                selected.tenant
                  .id
              }
              idempotencyKey={
                randomUUID()
              }
              today={
                dateInputValue()
              }
              charges={selected.charges.map(
                (charge) => ({
                  id: charge.id,

                  periodYear:
                    charge.periodYear,

                  periodMonth:
                    charge.periodMonth,

                  /**
                   * React Client Components cannot receive
                   * BigInt values directly from a Server Component.
                   *
                   * Therefore convert centavos to a normal string.
                   */
                  balance:
                    charge.balance.toString(),

                  location:
                    charge.location,
                }),
              )}
            />
          )}
        </div>
      )}
    </div>
  );
}