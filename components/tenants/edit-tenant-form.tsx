"use client";

import { useActionState } from "react";

import {
  updateTenantAction,
} from "@/app/(app)/tenants/manage-actions";

import {
  INITIAL_ACTION_STATE,
} from "@/lib/action-state";

import {
  ActionMessage,
} from "@/components/forms/action-message";

import {
  SubmitButton,
} from "@/components/forms/submit-button";
import { primaryButtonClass } from "@/lib/ui-classes";

type TenantData = {
  id: string;

  fullName: string;

  phone: string | null;
  email: string | null;

  emergencyContactName:
    string | null;

  emergencyContactPhone:
    string | null;

  notes: string | null;
};

type Props = {
  tenant: TenantData;
};

export function EditTenantForm({
  tenant,
}: Props) {
  /**
   * useActionState lets the Client Component call our
   * Server Action while receiving a normal ActionState back.
   *
   * Example:
   *
   * Form
   *   ↓
   * Server Action
   *   ↓
   * Service validation fails
   *   ↓
   * { status: "error", message: "..." }
   *   ↓
   * displayed here
   *
   * We do NOT need to crash the entire page for a normal
   * validation problem.
   */
  const [
    state,
    action,
  ] =
    useActionState(
      updateTenantAction.bind(
        null,
        tenant.id,
      ),

      INITIAL_ACTION_STATE,
    );

  return (
    <form
      action={action}
      className="space-y-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <ActionMessage
        state={state}
      />

      {/* BASIC INFORMATION */}
      <section>
        <div>
          <h2 className="font-semibold text-zinc-950">
            Tenant information
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Update the tenant&apos;s contact and personal information.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field
              label="Full name"
              name="fullName"
              defaultValue={
                tenant.fullName
              }
              required
            />
          </div>

          <Field
            label="Phone"
            name="phone"
            type="tel"
            defaultValue={
              tenant.phone ?? ""
            }
            placeholder="09XXXXXXXXX"
          />

          <Field
            label="Email"
            name="email"
            type="email"
            defaultValue={
              tenant.email ?? ""
            }
            placeholder="tenant@example.com"
          />
        </div>
      </section>

      {/* EMERGENCY CONTACT */}
      <section className="border-t border-zinc-100 pt-7">
        <div>
          <h2 className="font-semibold text-zinc-950">
            Emergency contact
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Optional contact information for emergencies.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field
            label="Contact name"
            name="emergencyContactName"
            defaultValue={
              tenant.emergencyContactName ??
              ""
            }
          />

          <Field
            label="Contact phone"
            name="emergencyContactPhone"
            type="tel"
            defaultValue={
              tenant.emergencyContactPhone ??
              ""
            }
          />
        </div>
      </section>

      {/* NOTES */}
      <section className="border-t border-zinc-100 pt-7">
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-zinc-800"
        >
          Notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={
            tenant.notes ?? ""
          }
          placeholder="Optional notes about this tenant..."
          className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
      </section>

      <div className="flex justify-end border-t border-zinc-100 pt-5">
        <SubmitButton
          pendingText="Saving changes..."
          className={primaryButtonClass}
        >
          Save changes
        </SubmitButton>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-zinc-800"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={
          defaultValue
        }
        placeholder={
          placeholder
        }
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}