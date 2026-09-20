"use client";

import {
  Archive,
  BedDouble,
  Pencil,
} from "lucide-react";

import {
  useActionState,
} from "react";

import {
  archiveSpaceAction,
  updateSpaceAction,
} from "@/app/(app)/properties/manage-actions";

import {
  ActionMessage,
} from "@/components/forms/action-message";

import {
  DestructiveActionForm,
} from "@/components/forms/destructive-action-form";

import {
  SubmitButton,
} from "@/components/forms/submit-button";

import {
  INITIAL_ACTION_STATE,
} from "@/lib/action-state";

type SpaceStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "INACTIVE";

type Props = {
  propertyId: string;
  unitId: string;

  space: {
    id: string;
    name: string;

    /**
     * Decimal values from Prisma should not be sent
     * directly to Client Components.
     *
     * The Server Component converts Decimal → string
     * before passing it here.
     */
    defaultRent: string | null;

    status: SpaceStatus;
  };
};

export function RentableSpaceEditor({
  propertyId,
  unitId,
  space,
}: Props) {
  /**
   * Connect this specific space to its update action.
   *
   * bind() safely supplies IDs from the server-rendered
   * record while the form supplies editable values.
   *
   * IMPORTANT:
   *
   * IDs still are NOT trusted for authorization.
   *
   * PropertyService validates:
   *
   * Space
   *   ↓
   * Unit
   *   ↓
   * Property
   *   ↓
   * authenticated landlord
   */
  const [
    updateState,
    updateAction,
  ] =
    useActionState(
      updateSpaceAction.bind(
        null,
        propertyId,
        unitId,
        space.id,
      ),

      INITIAL_ACTION_STATE,
    );

  const occupied =
    space.status ===
    "OCCUPIED";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      {/* SPACE SUMMARY */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <BedDouble
              size={18}
              className="shrink-0 text-zinc-500"
            />

            <p className="truncate font-medium text-zinc-950">
              {space.name}
            </p>
          </div>

          <p className="mt-2 text-lg font-semibold tracking-tight text-zinc-950">
            {space.defaultRent
              ? `₱${Number(
                  space.defaultRent,
                ).toLocaleString(
                  "en-PH",
                  {
                    minimumFractionDigits:
                      0,

                    maximumFractionDigits:
                      2,
                  },
                )}`
              : "No default rent"}
          </p>
        </div>

        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",

            occupied
              ? "bg-emerald-50 text-emerald-700"
              : space.status ===
                  "AVAILABLE"
                ? "bg-blue-50 text-blue-700"
                : "bg-zinc-100 text-zinc-600",
          ].join(" ")}
        >
          {space.status}
        </span>
      </div>

      {/* EDIT SPACE */}
      <details className="mt-4 border-t border-zinc-100 pt-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950">
          <Pencil
            size={15}
          />

          Edit rental space
        </summary>

        <form
          action={
            updateAction
          }
          className="mt-4 space-y-4"
        >
          <ActionMessage
            state={
              updateState
            }
          />

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-600">
              Space name
            </label>

            <input
              name="name"
              required
              defaultValue={
                space.name
              }
              placeholder="Bed A / Entire Unit"
              className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-600">
              Default monthly rent
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">
                ₱
              </span>

              <input
                name="defaultRent"
                type="number"
                min="0"
                step="0.01"
                required
                defaultValue={
                  space.defaultRent ??
                  "0.00"
                }
                className="w-full rounded-xl border border-zinc-200 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-zinc-400">
              This affects new leases only. Existing lease rent will not be changed.
            </p>
          </div>

          <SubmitButton
            pendingText="Saving space..."
            className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
          >
            Save changes
          </SubmitButton>
        </form>
      </details>

      {/* ARCHIVE SPACE */}
      <div className="mt-4 border-t border-zinc-100 pt-4">
        <div className="mb-3 flex items-start gap-2">
          <Archive
            size={15}
            className="mt-0.5 shrink-0 text-zinc-400"
          />

          <div>
            <p className="text-xs font-medium text-zinc-600">
              Archive rental space
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-400">
              Historical leases and payment records will remain preserved.
            </p>
          </div>
        </div>

        <DestructiveActionForm
          action={archiveSpaceAction.bind(
            null,
            propertyId,
            unitId,
            space.id,
          )}
          confirmMessage={`Archive ${space.name}? Historical lease and payment records will remain available.`}
          label="Archive space"
          pendingText="Archiving..."
        />

        {occupied && (
          <p className="mt-2 text-xs text-amber-700">
            This space is occupied. Its active lease must be ended before it can be archived.
          </p>
        )}
      </div>
    </div>
  );
}