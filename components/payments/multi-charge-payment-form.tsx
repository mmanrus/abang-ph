"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import {
  centsToMoney,
  formatPHP,
  moneyToCents,
} from "@/lib/money";

import {
  recordMultiChargePayment,
} from "@/app/(app)/payments/actions";
import { SubmitButton } from "../forms/submit-button";

type Charge = {
  id: string;

  periodYear: number;
  periodMonth: number;

  balance: string;

  location: string;
};

type Props = {
  tenantId: string;

  charges: Charge[];

  idempotencyKey: string;

  today: string;
};

type AllocationState = {
  [rentChargeId: string]:
  string;
};

function getMonthLabel(
  year: number,
  month: number,
) {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      Date.UTC(
        year,
        month - 1,
        1,
      ),
    ),
  );
}

export function MultiChargePaymentForm({
  tenantId,
  charges,
  idempotencyKey,
  today,
}: Props) {
  const [
    allocations,
    setAllocations,
  ] =
    useState<AllocationState>(
      {},
    );

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  /**
   * Client-side total.
   *
   * We use the same centavo helper instead of doing:
   *
   *   0.1 + 0.2
   *
   * Financial calculations should avoid floating-point
   * surprises whenever possible.
   */
  const total =
    useMemo(
      () => {
        let cents = 0n;

        for (
          const value of
          Object.values(
            allocations,
          )
        ) {
          if (!value) {
            continue;
          }

          try {
            cents +=
              moneyToCents(
                value,
              );
          } catch {
            // Invalid inputs will be handled when submitting.
          }
        }

        return cents;
      },
      [allocations],
    );

  function updateAllocation(
    chargeId: string,
    value: string,
  ) {
    setAllocations(
      (current) => ({
        ...current,

        [chargeId]:
          value,
      }),
    );
  }

  function fillBalance(
    chargeId: string,
    balance: string,
  ) {
    updateAllocation(
      chargeId,
      balance,
    );
  }

  function clearAllocation(
    chargeId: string,
  ) {
    updateAllocation(
      chargeId,
      "",
    );
  }

  function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    setError(null);

    const selected: {
      rentChargeId: string;
      amount: string;
    }[] = [];

    try {
      for (
        const charge of
        charges
      ) {
        const value =
          allocations[
          charge.id
          ];

        if (!value) {
          continue;
        }

        const amount =
          moneyToCents(
            value,
          );

        if (
          amount <= 0n
        ) {
          continue;
        }

        const balance =
          BigInt(
            charge.balance,
          );

        if (
          amount >
          balance
        ) {
          event.preventDefault();

          setError(
            `Allocation for ${getMonthLabel(
              charge.periodYear,
              charge.periodMonth,
            )} exceeds its remaining balance.`,
          );

          return;
        }

        selected.push({
          rentChargeId:
            charge.id,

          amount:
            centsToMoney(
              amount,
            ),
        });
      }
    } catch {
      event.preventDefault();

      setError(
        "One or more allocation amounts are invalid.",
      );

      return;
    }

    if (
      selected.length === 0
    ) {
      event.preventDefault();

      setError(
        "Allocate payment to at least one rent charge.",
      );

      return;
    }

    /**
     * We serialize the selected allocations into a hidden field.
     *
     * This makes the Server Action receive:
     *
     * [
     *   {
     *     rentChargeId: "...",
     *     amount: "2000.00"
     *   },
     *   {
     *     rentChargeId: "...",
     *     amount: "5000.00"
     *   }
     * ]
     *
     * Again: the server validates all of it.
     */
    const form =
      event.currentTarget;

    const allocationsField =
      form.elements.namedItem(
        "allocations",
      ) as HTMLInputElement;

    const amountField =
      form.elements.namedItem(
        "amount",
      ) as HTMLInputElement;

    allocationsField.value =
      JSON.stringify(
        selected,
      );

    amountField.value =
      centsToMoney(
        total,
      );
  }

  return (
    <form
      action={
        recordMultiChargePayment
      }
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      <input
        type="hidden"
        name="tenantId"
        value={tenantId}
      />

      <input
        type="hidden"
        name="idempotencyKey"
        value={
          idempotencyKey
        }
      />

      <input
        type="hidden"
        name="allocations"
      />

      <input
        type="hidden"
        name="amount"
      />

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2 className="font-semibold text-zinc-950">
            Outstanding rent
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Choose how much of this payment should be applied to each rent charge.
          </p>
        </div>

        <div className="divide-y divide-zinc-100">
          {charges.map(
            (charge) => {
              const balance =
                BigInt(
                  charge.balance,
                );

              const value =
                allocations[
                charge.id
                ] ?? "";

              return (
                <div
                  key={
                    charge.id
                  }
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row">
                    <div>
                      <p className="font-semibold text-zinc-950">
                        {getMonthLabel(
                          charge.periodYear,
                          charge.periodMonth,
                        )}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        {
                          charge.location
                        }
                      </p>

                      <p className="mt-3 text-sm text-zinc-500">
                        Remaining balance
                      </p>

                      <p className="mt-1 text-lg font-semibold text-zinc-950">
                        {formatPHP(
                          balance,
                        )}
                      </p>
                    </div>

                    <div className="w-full sm:w-56">
                      <label className="mb-2 block text-sm font-medium text-zinc-700">
                        Allocate
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                          ₱
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            value
                          }
                          onChange={(
                            event,
                          ) =>
                            updateAllocation(
                              charge.id,
                              event
                                .target
                                .value,
                            )
                          }
                          className="w-full rounded-xl border border-zinc-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                        />
                      </div>

                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            fillBalance(
                              charge.id,
                              centsToMoney(
                                balance,
                              ),
                            )
                          }
                          className="text-xs font-medium text-emerald-700"
                        >
                          Pay full balance
                        </button>

                        {value && (
                          <button
                            type="button"
                            onClick={() =>
                              clearAllocation(
                                charge.id,
                              )
                            }
                            className="text-xs font-medium text-zinc-500"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="font-semibold text-zinc-950">
          Payment details
        </h2>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Payment method
            </label>

            <select
              name="method"
              defaultValue="CASH"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="CASH">
                Cash
              </option>

              <option value="GCASH">
                GCash
              </option>

              <option value="MAYA">
                Maya
              </option>

              <option value="BANK_TRANSFER">
                Bank Transfer
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Date received
            </label>

            <input
              name="paidAt"
              type="date"
              required
              defaultValue={
                today
              }
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Reference number
            </label>

            <input
              name="referenceNumber"
              placeholder="Optional"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-700">
              Notes
            </label>

            <input
              name="notes"
              placeholder="Optional"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="sticky bottom-20 rounded-2xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur lg:bottom-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-zinc-500">
              Payment total
            </p>

            <p className="text-2xl font-semibold tracking-tight text-zinc-950">
              {formatPHP(
                total,
              )}
            </p>
          </div>
          <SubmitButton
            disabled={total === 0n}
            pendingText="Recording..."
            className="
              rounded-xl
              bg-emerald-600
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            Record payment
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}