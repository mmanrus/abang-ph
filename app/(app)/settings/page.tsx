import {
  ImageIcon,
  ShieldCheck,
} from "lucide-react";

import type {
  Metadata,
} from "next";

import {
  BusinessProfileForm,
} from "@/components/settings/business-profile-form";

import {
  SuccessBanner,
} from "@/components/feedback/success-banner";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

export const metadata: Metadata = {
  title:
    "Settings",
};

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function SettingsPage({
  searchParams,
}: Props) {
  const query =
    await searchParams;

  const {
    landlord,
  } =
    await requireLandlord();

  const initial =
    landlord.displayName
      ?.charAt(0)
      .toUpperCase() ?? "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
          Settings
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage your business profile and workspace preferences.
        </p>
      </div>

      <div className="mt-6">
        <SuccessBanner
          code={
            query.success
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ===================================== */}
        {/* BRAND PREVIEW                         */}
        {/* ===================================== */}

        <aside className="space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Workspace preview
            </p>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-lg font-semibold text-white">
                {initial}
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-zinc-950">
                  {
                    landlord.displayName
                  }
                </p>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Powered by Abang PH
                </p>
              </div>
            </div>
          </section>

          {/* LOGO READY */}
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
              <ImageIcon
                size={19}
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-zinc-950">
              Business logo
            </h2>

            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Logo upload will be enabled after production file storage is configured.
            </p>

            <div className="mt-4 rounded-xl bg-zinc-50 px-3 py-2 text-xs text-zinc-500">
              For now, Abang uses your business initial as the workspace avatar.
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <ShieldCheck
              size={20}
              className="text-emerald-700"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-medium text-emerald-900">
              Branding does not affect ownership
            </p>

            <p className="mt-1 text-xs leading-5 text-emerald-800">
              Changing your business name only changes presentation. Your landlord account ID continues to control data ownership and authorization.
            </p>
          </section>
        </aside>

        {/* ===================================== */}
        {/* SETTINGS FORM                         */}
        {/* ===================================== */}

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <BusinessProfileForm
            profile={{
              displayName:
                landlord.displayName,

              phone:
                landlord.phone,

              timezone:
                landlord.timezone,

              currency:
                landlord.currency,
            }}
          />
        </section>
      </div>
    </div>
  );
}