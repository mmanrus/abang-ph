import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  createTenant,
} from "../actions";
import { SubmitButton } from "@/components/forms/submit-button";
import { primaryButtonClass } from "@/lib/ui-classes";

export default function NewTenantPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/tenants"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft size={17} />

        Tenants
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Add tenant
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Add the tenant first. You can
          assign their rental space next.
        </p>
      </div>

      <form
        action={createTenant}
        className="mt-7 space-y-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <section>
          <h2 className="font-semibold text-zinc-950">
            Tenant information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                label="Full name"
                name="fullName"
                placeholder="Juan Dela Cruz"
                required
              />
            </div>

            <Field
              label="Phone"
              name="phone"
              type="tel"
              placeholder="09XXXXXXXXX"
            />

            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="juan@example.com"
            />
          </div>
        </section>

        <section className="border-t border-zinc-100 pt-7">
          <h2 className="font-semibold text-zinc-950">
            Emergency contact
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="Contact name"
              name="emergencyContactName"
            />

            <Field
              label="Contact phone"
              name="emergencyContactPhone"
              type="tel"
            />
          </div>
        </section>

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
            rows={4}
            placeholder="Optional notes about this tenant..."
            className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
        </section>

        <div className="flex justify-end border-t border-zinc-100 pt-5">
          <SubmitButton
            pendingText="Creating tenant..."
            className={primaryButtonClass}
          >
            Create tenant
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
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
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}