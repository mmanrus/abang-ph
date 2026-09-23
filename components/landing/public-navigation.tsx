"use client";

import Link from "next/link";

import {
    ArrowRight,
    Menu,
    X,
} from "lucide-react";

import {
    useEffect,
    useState,
} from "react";

import {
    InstallAbang,
} from "@/components/pwa/install-abang";

type Props = {
    signedIn: boolean;
};

/**
 * DESKTOP_BREAKPOINT
 * -------------------
 *
 * Matches Tailwind's default `md` breakpoint (768px). Kept as a
 * JS constant because we drive the desktop/mobile split with
 * `matchMedia` below rather than trusting Tailwind's `md:`
 * variant alone — see note in `useIsDesktop`.
 */
const DESKTOP_BREAKPOINT_QUERY = "(min-width: 768px)";

/**
 * useIsDesktop
 * -------------
 *
 * We *also* use Tailwind's `md:` utility classes below (belt and
 * suspenders), but this hook is the source of truth for whether
 * we render the inline desktop nav or the hamburger. Some
 * environments (stale build caches, certain browser extensions,
 * etc.) can cause a `md:` media-query utility to silently fail to
 * apply even though the actual viewport is well above the
 * breakpoint. Driving the split from `window.matchMedia` in JS
 * sidesteps that entirely, since it reads the real viewport
 * directly instead of relying on a CSS rule having been generated
 * and applied correctly.
 *
 * Returns `null` during SSR / before mount (we don't know the
 * viewport yet), then `true`/`false` once mounted.
 */
function useIsDesktop() {
    const [
        isDesktop,
        setIsDesktop,
    ] = useState<boolean | null>(null);

    useEffect(() => {
        const mediaQuery =
            window.matchMedia(
                DESKTOP_BREAKPOINT_QUERY,
            );

        setIsDesktop(
            mediaQuery.matches,
        );

        function handleChange(
            event: MediaQueryListEvent,
        ) {
            setIsDesktop(
                event.matches,
            );
        }

        mediaQuery.addEventListener(
            "change",
            handleChange,
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleChange,
            );
        };
    }, []);

    return isDesktop;
}

export function PublicNavigation({
    signedIn,
}: Props) {
    const [
        menuOpen,
        setMenuOpen,
    ] = useState(false);

    const isDesktop =
        useIsDesktop();

    function closeMenu() {
        setMenuOpen(false);
    }

    // Before mount we don't know the viewport yet. Render nothing
    // in that brief window rather than guessing, to avoid a flash
    // of the wrong nav variant.
    if (isDesktop === null) {
        return (
            <div className="ml-auto h-10 w-10 shrink-0" />
        );
    }

    if (isDesktop) {
        return (
            <nav
                aria-label="Public navigation"
                className="ml-auto flex shrink-0 items-center gap-2"
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
        );
    }

    return (
        <div className="relative ml-auto shrink-0">
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