"use client";

import {
  Archive,
  DoorOpen,
  Pencil,
} from "lucide-react";

import {
  useActionState,
} from "react";

import {
  archiveUnitAction,
  updateUnitAction,
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

import {
  RentableSpaceEditor,
} from "@/components/properties/rentable-space-editor";

type SpaceStatus =
  | "AVAILABLE"
  | "OCCUPIED"
  | "INACTIVE";

type Props = {
  propertyId: string;

  unit: {
    id: string;

    name: string;

    floor:
      string | null;

    description:
      string | null;

    rentableSpaces: {
      id: string;

      name: string;

      defaultRent:
        string | null;

      status:
        SpaceStatus;
    }[];
  };

  addSpaceForm:
    React.ReactNode;
};

export function UnitManagementCard({
  propertyId,
  unit,
  addSpaceForm,
}: Props) {
  const [
    updateState,
    updateAction,
  ] =
    useActionState(
      updateUnitAction.bind(
        null,
        propertyId,
        unit.id,
      ),

      INITIAL_ACTION_STATE,
    );

  const occupiedCount =
    unit.rentableSpaces.filter(
      (space) =>
        space.status ===
        "OCCUPIED",
    ).length;

  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      {/* ROOM HEADER */}
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 px-5 py-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
            <DoorOpen
              size={19}
            />
          </div>

          <div>
            <h2 className="font-semibold text-zinc-950">
              {unit.name}
            </h2>

            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-500">
              {unit.floor && (
                <span>
                  {unit.floor}
                </span>
              )}

              <span>
                {
                  unit
                    .rentableSpaces
                    .length
                }{" "}
                spaces
              </span>

              <span>
                {occupiedCount} occupied
              </span>
            </div>
          </div>
        </div>

        {occupiedCount >
          0 && (
          <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            {occupiedCount} occupied
          </span>
        )}
      </div>

      <div className="p-5">
        {/* RENTABLE SPACES */}
        {unit.rentableSpaces
          .length === 0 ? (
          <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center">
            <p className="text-sm font-medium text-zinc-700">
              No rentable spaces
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Add a bed, room, or entire unit below.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {unit.rentableSpaces.map(
              (space) => (
                <RentableSpaceEditor
                  key={
                    space.id
                  }
                  propertyId={
                    propertyId
                  }
                  unitId={
                    unit.id
                  }
                  space={
                    space
                  }
                />
              ),
            )}
          </div>
        )}

        {/* ADD SPACE FORM */}
        <div className="mt-5 border-t border-zinc-100 pt-5">
          {addSpaceForm}
        </div>

        {/* ROOM MANAGEMENT */}
        <details className="mt-6 border-t border-zinc-100 pt-5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950">
            <Pencil
              size={15}
            />

            Manage room / unit
          </summary>

          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_280px]">
            {/* EDIT */}
            <form
              action={
                updateAction
              }
              className="space-y-4"
            >
              <ActionMessage
                state={
                  updateState
                }
              />

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-600">
                  Room / unit name
                </label>

                <input
                  name="name"
                  required
                  defaultValue={
                    unit.name
                  }
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-600">
                  Floor
                </label>

                <input
                  name="floor"
                  defaultValue={
                    unit.floor ??
                    ""
                  }
                  placeholder="1st Floor"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-600">
                  Description
                </label>

                <textarea
                  name="description"
                  rows={3}
                  defaultValue={
                    unit.description ??
                    ""
                  }
                  placeholder="Optional room notes..."
                  className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500"
                />
              </div>

              <SubmitButton
                pendingText="Saving room..."
                className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
              >
                Save room
              </SubmitButton>
            </form>

            {/* ARCHIVE */}
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
              <div className="flex items-start gap-2">
                <Archive
                  size={16}
                  className="mt-0.5 shrink-0 text-red-500"
                />

                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Archive room
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Its rental spaces will also be archived. Historical leases and financial records remain preserved.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <DestructiveActionForm
                  action={archiveUnitAction.bind(
                    null,
                    propertyId,
                    unit.id,
                  )}
                  confirmMessage={`Archive ${unit.name}? All inactive rental spaces inside it will also be archived.`}
                  label="Archive room"
                  pendingText="Archiving..."
                />
              </div>

              {occupiedCount >
                0 && (
                <p className="mt-3 text-xs leading-5 text-red-700">
                  This room has an occupied space. End all active leases before archiving it.
                </p>
              )}
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}