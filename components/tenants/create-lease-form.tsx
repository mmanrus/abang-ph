"use client";

import {
  useState,
} from "react";

import {
  createLeaseAction,
} from "@/app/(app)/tenants/actions";
import { SubmitButton } from "../forms/submit-button";
import { SpacePickerField } from "../pickers/space-picker-field";
import { primaryButtonClass } from "@/lib/ui-classes";

type Props = {
  tenantId: string;
};

function todayInputValue() {
  const date = new Date();

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1,
    ).padStart(2, "0");

  const day =
    String(
      date.getDate(),
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function CreateLeaseForm({
  tenantId,
}: Props) {
  /**
   * NOTE: the property/space list used to be fetched upfront
   * by the parent page and passed in as `spaces`. SpacePickerField
   * now fetches properties and their available spaces on demand
   * (via server actions), so this component no longer needs that
   * prop -- and the parent page no longer needs to fetch it
   * either.
   */
  const [monthlyRent, setMonthlyRent] =
    useState("");

  return (
    <form
      action={createLeaseAction.bind(
        null,
        tenantId,
      )}
      className="space-y-5"
    >
      <SpacePickerField
        name="rentableSpaceId"
        label="Property / Room / Space"
        placeholder="Select a rentable space"
        propertySearchPlaceholder="Search name, barangay, city, province..."
        spaceSearchPlaceholder="Search room or space..."
        onSelect={(space) =>
          setMonthlyRent(
            space.defaultRent ?? "",
          )
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            Monthly rent
          </label>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
              ₱
            </span>

            <input
              name="monthlyRent"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={monthlyRent}
              onChange={(event) =>
                setMonthlyRent(
                  event.target.value,
                )
              }
              className="w-full rounded-xl border border-zinc-200 py-3 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            Rent due every
          </label>

          <div className="flex items-center gap-2">
            <input
              name="dueDay"
              type="number"
              min="1"
              max="31"
              defaultValue="5"
              required
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            />

            <span className="shrink-0 text-sm text-zinc-500">
              day
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            Start date
          </label>

          <input
            name="startDate"
            type="date"
            required
            defaultValue={
              todayInputValue()
            }
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-800">
            End date
          </label>

          <input
            name="endDate"
            type="date"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
          />

          <p className="mt-1 text-xs text-zinc-400">
            Optional
          </p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-800">
          Security deposit
        </label>

        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
            ₱
          </span>

          <input
            name="securityDeposit"
            type="number"
            min="0"
            step="0.01"
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
        pendingText="Creating lease..."
        className={primaryButtonClass}
      >
        Create lease
      </SubmitButton>
    </form>
  );
}