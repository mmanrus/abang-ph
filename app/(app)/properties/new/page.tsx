import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createProperty } from "../actions";

export default function NewPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href="/properties"
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
      >
        <ArrowLeft size={17} />
        Properties
      </Link>

      <div className="mt-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Add property
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Add an apartment, boarding house,
          dormitory, house, or commercial
          property.
        </p>
      </div>

      <form
        action={createProperty}
        className="mt-7 space-y-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <Field
          label="Property name"
          name="name"
          placeholder="Sunrise Boarding House"
          required
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-800">
              Property type
            </label>

            <select
              name="type"
              defaultValue="BOARDING_HOUSE"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
            >
              <option value="BOARDING_HOUSE">
                Boarding House
              </option>

              <option value="APARTMENT">
                Apartment
              </option>

              <option value="DORMITORY">
                Dormitory
              </option>

              <option value="BEDSPACE">
                Bedspace
              </option>

              <option value="HOUSE">
                House
              </option>

              <option value="COMMERCIAL">
                Commercial
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          <Field
            label="Street / Address"
            name="addressLine1"
            placeholder="123 Sample Street"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field
            label="Barangay"
            name="barangay"
          />

          <Field
            label="City / Municipality"
            name="city"
          />

          <Field
            label="Province"
            name="province"
          />
        </div>

        <div className="flex justify-end border-t border-zinc-100 pt-5">
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Create property
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-800">
        {label}
      </label>

      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
    </div>
  );
}