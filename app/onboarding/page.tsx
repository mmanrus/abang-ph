import { completeOnboarding } from "./actions";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await requireUser();

  const existingLandlord =
    await prisma.landlordAccount.findUnique({
      where: {
        userId: user.id,
      },

      select: {
        id: true,
      },
    });

  if (existingLandlord) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-emerald-600">
            ABANG PH
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
            Set up your rental business
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
            Welcome, {user.name}. Tell us about your rental
            business and your first property.
          </p>
        </div>

        <form
          action={completeOnboarding}
          className="space-y-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <section>
            <h2 className="text-lg font-semibold text-zinc-950">
              Your business
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="displayName"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Business / landlord name
                </label>

                <input
                  id="displayName"
                  name="displayName"
                  required
                  placeholder="Rusiana Rentals"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </section>

          <section className="border-t border-zinc-100 pt-8">
            <h2 className="text-lg font-semibold text-zinc-950">
              First property
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="propertyName"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Property name
                </label>

                <input
                  id="propertyName"
                  name="propertyName"
                  required
                  placeholder="Sunrise Boarding House"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="propertyType"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Property type
                </label>

                <select
                  id="propertyType"
                  name="propertyType"
                  defaultValue="BOARDING_HOUSE"
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
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

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  City / Municipality
                </label>

                <input
                  id="city"
                  name="city"
                  placeholder="Cebu City"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="province"
                  className="mb-2 block text-sm font-medium text-zinc-800"
                >
                  Province
                </label>

                <input
                  id="province"
                  name="province"
                  placeholder="Cebu"
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            Finish setup
          </button>
        </form>
      </div>
    </main>
  );
}