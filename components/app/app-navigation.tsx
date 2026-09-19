"use client";

import {
  Building2,
  Home,
  LogOut,
  ReceiptText,
  UsersRound,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

type AppNavigationProps = {
  landlordName: string | null;
  userName: string;
};

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },

  {
    label: "Properties",
    href: "/properties",
    icon: Building2,
  },
  {
    label: "Tenants",
    href: "/tenants",
    icon: UsersRound,
  },
  {
    label: "Rent",
    href: "/rent",
    icon: ReceiptText,
  },
];

export function AppNavigation({
  landlordName,
  userName,
}: AppNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isSigningOut, setIsSigningOut] =
    useState(false);

  async function signOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();

      router.push("/login");
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-zinc-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-bold text-white">
              A
            </div>

            <div className="min-w-0">
              <p className="font-semibold tracking-tight text-zinc-950">
                Abang PH
              </p>

              <p className="truncate text-xs text-zinc-500">
                {landlordName ?? "Rental Management"}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
                ].join(" ")}
              >
                <Icon size={19} />

                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-100 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-zinc-950">
              {userName}
            </p>

            <p className="text-xs text-zinc-500">
              Landlord account
            </p>
          </div>

          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-950 disabled:opacity-50"
          >
            <LogOut size={18} />

            {isSigningOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <div>
            <p className="font-semibold text-zinc-950">
              Abang PH
            </p>

            <p className="max-w-48 truncate text-xs text-zinc-500">
              {landlordName}
            </p>
          </div>

          <button
            type="button"
            onClick={signOut}
            disabled={isSigningOut}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white lg:hidden">
        <div className="mx-auto flex max-w-lg">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium",
                  active
                    ? "text-emerald-700"
                    : "text-zinc-500",
                ].join(" ")}
              >
                <Icon size={20} />

                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}