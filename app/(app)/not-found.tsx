import Link from "next/link";

import {
  Building2,
  FileQuestion,
  LayoutDashboard,
  UsersRound,
} from "lucide-react";

export default function AppNotFound() {
  /**
   * SECURITY-FRIENDLY 404
   * ---------------------
   *
   * We intentionally do NOT say:
   *
   *   "Tenant ID xyz does not belong to you."
   *
   * or:
   *
   *   "That property exists but belongs to another landlord."
   *
   * Both:
   *
   *   resource does not exist
   *
   * and:
   *
   *   resource is not accessible to this landlord
   *
   * can safely result in the same generic 404.
   *
   * This avoids exposing information about records belonging
   * to other accounts.
   */
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600">
          <FileQuestion
            size={26}
          />
        </div>

        <p className="mt-5 text-sm font-medium text-emerald-700">
          404
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          We couldn&apos;t find that page
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          The record may no longer be available,
          the link may be incorrect, or you may not
          have access to it.
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <LayoutDashboard
              size={16}
            />

            Dashboard
          </Link>

          <Link
            href="/properties"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <Building2
              size={16}
            />

            Properties
          </Link>

          <Link
            href="/tenants"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <UsersRound
              size={16}
            />

            Tenants
          </Link>
        </div>
      </div>
    </div>
  );
}