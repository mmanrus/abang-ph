"use client";

import Link from "next/link";

import {
    ArrowRight,
    Menu,
    X,
} from "lucide-react";

import {
    useState,
} from "react";

import {
    InstallAbang,
} from "@/components/pwa/install-abang";

type Props = {
    signedIn: boolean;
};

export function PublicNavigation({
    signedIn,
}: Props) {
    const [
        menuOpen,
        setMenuOpen,
    ] = useState(false);

    function closeMenu() {
        setMenuOpen(false);
    }

    return (
        <div className="relative ml-auto shrink-0">
            {/* ========================================= */}
            {/* DESKTOP NAVIGATION                        */}
            {/* ========================================= */}

            <nav
                aria-label="Public navigation"
                className="hidden items-center gap-2 md:flex"
            >
                {signedIn ? (
                    <Link
                        href="/dashboard"
                        className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-600
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:bg-emerald-700
            "
                    >
                        Back to dashboard

                        <ArrowRight
                            size={16}
                            aria-hidden="true"
                        />
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="
                inline-flex
                h-10
                items-center
                justify-center
                rounded-xl
                px-3
                text-sm
                font-medium
                text-zinc-600
                transition
                hover:bg-zinc-100
                hover:text-zinc-950
              "
                        >
                            Sign in
                        </Link>

                        <Link
                            href="/register"
                            className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-emerald-600
                px-4
                text-sm
                font-medium
                text-white
                transition
                hover:bg-emerald-700
              "
                        >
                            Get started

                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                            />
                        </Link>

                        <InstallAbang
                            variant="compact"
                        />
                    </>
                )}
            </nav>

            {/* ========================================= */}
            {/* MOBILE HAMBURGER                          */}
            {/* ========================================= */}

            <button
                type="button"
                onClick={() =>
                    setMenuOpen(
                        (current) =>
                            !current,
                    )
                }
                aria-expanded={menuOpen}
                aria-controls="mobile-public-menu"
                aria-label={
                    menuOpen
                        ? "Close navigation menu"
                        : "Open navigation menu"
                }
                className="
          inline-flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          border
          border-zinc-200
          bg-white
          text-zinc-700
          transition
          hover:bg-zinc-50
          md:hidden
        "
            >
                {menuOpen ? (
                    <X
                        size={20}
                        aria-hidden="true"
                    />
                ) : (
                    <Menu
                        size={20}
                        aria-hidden="true"
                    />
                )}
            </button>

            {/* ========================================= */}
            {/* MOBILE MENU                               */}
            {/* ========================================= */}

            {menuOpen && (
                <div
                    id="mobile-public-menu"
                    className="
            absolute
            right-0
            top-[calc(100%+0.5rem)]
            z-50
            w-38
            max-w-[calc(100vw-2rem)]
            overflow-hidden
            rounded-2xl
            border
            border-zinc-200
            bg-white
            p-2
            shadow-xl
            md:hidden
        "
                >
                    {signedIn ? (
                        <Link
                            href="/dashboard"
                            onClick={closeMenu}
                            className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-emerald-600
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-emerald-700
                "
                        >
                            Dashboard

                            <ArrowRight
                                size={16}
                                aria-hidden="true"
                                className="shrink-0"
                            />
                        </Link>
                    ) : (
                        <div className="space-y-1">
                            <Link
                                href="/login"
                                onClick={closeMenu}
                                className="
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        rounded-xl
                        text-sm
                        font-medium
                        text-zinc-700
                        transition
                        hover:bg-zinc-50
                    "
                            >
                                Sign in
                            </Link>

                            <Link
                                href="/register"
                                onClick={closeMenu}
                                className="
                        flex
                        h-11
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-emerald-600
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:bg-emerald-700
                    "
                            >
                                Get started

                                <ArrowRight
                                    size={16}
                                    aria-hidden="true"
                                    className="shrink-0"
                                />
                            </Link>

                            <div
                                className="
                        [&_button]:h-11
                        [&_button]:w-full
                        [&_button]:justify-center
                        [&_button]:rounded-xl
                    "
                            >
                                <InstallAbang
                                    variant="compact"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}