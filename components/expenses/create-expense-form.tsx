"use client";

import {
  useActionState,
} from "react";

import {
  createExpenseAction,
} from "@/app/(app)/expenses/actions";

import {
  INITIAL_ACTION_STATE,
} from "@/lib/action-state";

import {
  ActionMessage,
} from "@/components/forms/action-message";

import {
  SubmitButton,
} from "@/components/forms/submit-button";
import {
  EntityPickerField,
} from "@/components/pickers/entity-picker-field";

type Props = {
  today:
  string;
};

export function CreateExpenseForm({
  today,
}: Props) {
  /**
   * useActionState connects:
   *
   * Client Form
   *      ↓
   * Server Action
   *      ↓
   * ActionState
   *      ↓
   * Error shown without crashing page
   */
  const [
    state,
    formAction,
  ] =
    useActionState(
      createExpenseAction,

      INITIAL_ACTION_STATE,
    );

  return (
    <form
      action={
        formAction
      }
      className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <ActionMessage
        state={state}
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-800">
          Property
        </label>

        <EntityPickerField
          kind="property"
          name="propertyId"
          label="Property"
          placeholder="Select property"
          searchPlaceholder="Search name, barangay, city, province..."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            Category
          </label>

          <select
            name="category"
            defaultValue="OTHER"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="MAINTENANCE">
              Maintenance
            </option>

            <option value="REPAIR">
              Repair
            </option>

            <option value="ELECTRICITY">
              Electricity
            </option>

            <option value="WATER">
              Water
            </option>

            <option value="INTERNET">
              Internet
            </option>

            <option value="SALARY">
              Salary
            </option>

            <option value="SUPPLIES">
              Supplies
            </option>

            <option value="TAX">
              Tax
            </option>

            <option value="OTHER">
              Other
            </option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            Expense date
          </label>

          <input
            type="date"
            name="expenseDate"
            required
            defaultValue={
              today
            }
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-800">
          Description
        </label>

        <input
          name="description"
          required
          placeholder="Bathroom faucet replacement"
          className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-800">
          Amount
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            ₱
          </span>

          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            className="w-full rounded-xl border border-zinc-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-800">
          Notes
        </label>

        <textarea
          name="notes"
          rows={3}
          className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <SubmitButton
        pendingText="Saving expense..."
        className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Save expense
      </SubmitButton>
    </form>
  );
}