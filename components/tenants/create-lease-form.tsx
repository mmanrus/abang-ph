"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  createLeaseAction,
} from "@/app/(app)/tenants/actions";

type SpaceOption = {
  id: string;
  label: string;
  defaultRent: string | null;
};

type Props = {
  tenantId: string;

  spaces: SpaceOption[];
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
  spaces,
}: Props) {
  const [spaceId, setSpaceId] =
    useState("");

  const selectedSpace =
    useMemo(
      () =>
        spaces.find(
          (space) =>
            space.id ===
            spaceId,
        ),
      [
        spaces,
        spaceId,
      ],
    );

  const [monthlyRent, setMonthlyRent] =
    useState("");

  function handleSpaceChange(
    id: string,
  ) {
    setSpaceId(id);

    const space =
      spaces.find(
        (item) =>
          item.id === id,
      );

    setMonthlyRent(
      space?.defaultRent ?? "",
    );
  }

  return (
    <form
      action={createLeaseAction.bind(
        null,
        tenantId,
      )}
      className="space-y-5"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-800">
          Property / Room / Space
        </label>

        <select
          name="rentableSpaceId"
          required
          value={spaceId}
          onChange={(event) =>
            handleSpaceChange(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">
            Select a rentable space
          </option>

          {spaces.map(
            (space) => (
              <option
                key={space.id}
                value={space.id}
              >
                {space.label}
              </option>
            ),
          )}
        </select>

        {selectedSpace && (
          <p className="mt-2 text-xs text-zinc-500">
            Selected:
            {" "}
            {
              selectedSpace.label
            }
          </p>
        )}
      </div>

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

      <button
        type="submit"
        disabled={
          spaces.length === 0
        }
        className="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
      >
        Create lease
      </button>
    </form>
  );
}