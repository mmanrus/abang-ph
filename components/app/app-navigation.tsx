"use client";

import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  ReceiptText,
  UsersRound,
  WalletCards,
  X,
  Settings
} from "lucide-react";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useEffect,
  useState,
} from "react";

import {
  authClient,
} from "@/lib/auth-client";

/**
 * Navigation configuration
 * ------------------------
 *
 * We keep the route definitions in one place.
 *
 * Desktop:
 *   shows everything.
 *
 * Mobile:
 *   shows only the most frequently-used sections.
 *
 * Less frequently-used destinations live under "More".
 *
 * This prevents the mobile navigation from becoming cramped
 * as Abang grows.
 */

const primaryNavigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
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
] as const;

const secondaryNavigation = [
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
  },

  {
    label: "Expenses",
    href: "/expenses",
    icon: WalletCards,
  },

  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },

  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
] as const;

const allNavigation = [
  ...primaryNavigation,
  ...secondaryNavigation,
];

type Props = {
  userName: string;
  landlordName: string | null;
};

export function AppNavigation({
  userName,
  landlordName,
}: Props) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    moreOpen,
    setMoreOpen,
  ] =
    useState(false);

  const displayLandlordName =
    landlordName?.trim() ||
    "Abang PH";
  const [
    signingOut,
    setSigningOut,
  ] =
    useState(false);

  /**
   * ACTIVE ROUTE
   * ------------
   *
   * Exact route:
   *
   *   /tenants
   *
   * Child route:
   *
   *   /tenants/123
   *   /tenants/123/edit
   *
   * should all keep "Tenants" highlighted.
   */
  function isActive(
    href: string,
  ) {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`,
      )
    );
  }

  const moreIsActive =
    secondaryNavigation.some(
      (item) =>
        isActive(
          item.href,
        ),
    );

  /**
   * Close the More menu whenever navigation occurs.
   *
   * Example:
   *
   * More
   *   ↓
   * Expenses
   *   ↓
   * drawer closes automatically
   */

  useEffect(
    () => {
      if (!moreOpen) {
        return;
      }

      /**
       * MOBILE MODAL UX
       * ----------------
       *
       * When the More sheet is open, prevent the page behind
       * it from scrolling.
       *
       * Otherwise the user can accidentally move the hidden
       * page while interacting with the sheet.
       */
      const originalOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      return () => {
        document.body.style.overflow =
          originalOverflow;
      };
    },
    [moreOpen],
  );
  /**
   * Keyboard accessibility:
   *
   * Escape closes the mobile sheet.
   */
  useEffect(
    () => {
      if (!moreOpen) {
        return;
      }

      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.key ===
          "Escape"
        ) {
          setMoreOpen(
            false,
          );
        }
      }

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [moreOpen],
  );

  async function handleLogout() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);

    try {
      await authClient.signOut();

      router.replace(
        "/login",
      );

      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      {/* ============================= */}
      {/* DESKTOP SIDEBAR              */}
      {/* ============================= */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-zinc-200 bg-white lg:flex">
        {/* BRAND */}
        <div className="border-b border-zinc-100 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white">
              {displayLandlordName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-950">
                {landlordName}
              </p>

              <p className="mt-0.5 text-[11px] text-zinc-500">
                Powered by Abang PH
              </p>
            </div>
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {allNavigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href,
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={[
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",

                    active
                      ? "bg-emerald-50 text-emerald-700"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950",
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    size={18}
                  />

                  {
                    item.label
                  }
                </Link>
              );
            },
          )}
        </nav>

        {/* DESKTOP ACCOUNT */}
        <div className="border-t border-zinc-100 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-zinc-900">
              {userName}
            </p>

            <p className="mt-0.5 text-xs text-zinc-500">
              Landlord
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleLogout
            }
            disabled={
              signingOut
            }
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-600 transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
          >
            <LogOut
              size={18}
            />

            {signingOut
              ? "Signing out..."
              : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ============================= */}
      {/* MOBILE HEADER                */}
      {/* ============================= */}

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur lg:hidden">
        <Link
          href="/dashboard"
          className="flex min-w-0 items-center gap-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white">
            {displayLandlordName
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="max-w-[190px] truncate text-sm font-semibold text-zinc-950">
              {landlordName}
            </p>

            <p className="text-[10px] text-zinc-500">
              Abang PH
            </p>
          </div>
        </Link>
      </header>

      {/* ============================= */}
      {/* MOBILE BOTTOM NAV            */}
      {/* ============================= */}

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        <div className="grid grid-cols-5">
          {primaryNavigation.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href,
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={[
                    "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition",

                    active
                      ? "text-emerald-700"
                      : "text-zinc-500",
                  ].join(
                    " ",
                  )}
                >
                  <Icon
                    size={20}
                    strokeWidth={
                      active
                        ? 2.4
                        : 2
                    }
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>
                </Link>
              );
            },
          )}

          <button
            type="button"
            aria-expanded={
              moreOpen
            }
            aria-controls="mobile-more-menu"
            onClick={() =>
              setMoreOpen(
                true,
              )
            }
            className={[
              "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition",

              moreIsActive
                ? "text-emerald-700"
                : "text-zinc-500",
            ].join(
              " ",
            )}
          >
            <MoreHorizontal
              size={20}
              strokeWidth={
                moreIsActive
                  ? 2.4
                  : 2
              }
            />

            More
          </button>
        </div>
      </nav>

      {/* ============================= */}
      {/* MOBILE MORE SHEET            */}
      {/* ============================= */}

      {moreOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="presentation"
        >
          {/* BACKDROP */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() =>
              setMoreOpen(
                false,
              )
            }
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
          />

          {/* SHEET */}
          <div
            id="mobile-more-menu"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl"
          >
            {/* DRAG HANDLE */}
            <div className="flex justify-center pt-3">
              <div className="h-1 w-10 rounded-full bg-zinc-300" />
            </div>

            {/* HEADER */}
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              <div>
                <h2 className="font-semibold text-zinc-950">
                  More
                </h2>

                <p className="mt-0.5 text-xs text-zinc-500">
                  Financial tools and reports
                </p>
              </div>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() =>
                  setMoreOpen(
                    false,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600"
              >
                <X
                  size={18}
                />
              </button>
            </div>

            {/* MORE LINKS */}
            <div className="px-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-200">
                {secondaryNavigation.map(
                  (
                    item,
                    index,
                  ) => {
                    const Icon =
                      item.icon;

                    const active =
                      isActive(
                        item.href,
                      );

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          setMoreOpen(false);
                        }}
                        aria-current={
                          active
                            ? "page"
                            : undefined
                        }
                        className={[
                          "flex items-center gap-4 px-4 py-4 transition",

                          index > 0
                            ? "border-t border-zinc-100"
                            : "",

                          active
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-zinc-700 hover:bg-zinc-50",
                        ].join(" ")}
                      >
                        <div
                          className={[
                            "flex h-10 w-10 items-center justify-center rounded-xl",

                            active
                              ? "bg-emerald-100"
                              : "bg-zinc-100",
                          ].join(
                            " ",
                          )}
                        >
                          <Icon
                            size={19}
                          />
                        </div>

                        <div>
                          <p className="text-sm font-medium">
                            {
                              item.label
                            }
                          </p>

                          <p className="mt-0.5 text-xs opacity-70">
                            {getNavigationDescription(
                              item.href,
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  },
                )}
              </div>

              {/* ACCOUNT */}
              <div className="mt-4 rounded-2xl border border-zinc-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 font-semibold text-emerald-700">
                    {userName
                      .charAt(
                        0,
                      )
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {
                        userName
                      }
                    </p>

                    <p className="truncate text-xs text-zinc-500">
                      {
                        landlordName
                      }
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  disabled={
                    signingOut
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                >
                  <LogOut
                    size={16}
                  />

                  {signingOut
                    ? "Signing out..."
                    : "Sign out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function getNavigationDescription(
  href: string,
) {
  switch (href) {
    case "/payments":
      return "Collection history and receipts";

    case "/expenses":
      return "Property operating expenses";

    case "/reports":
      return "Rent and cash-flow reports";
    case "/settings":
      return "Business profile and workspace settings";
    default:
      return "";
  }
}