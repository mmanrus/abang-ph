"use client";

import {
  LoaderCircle,
  Search,
} from "lucide-react";

import {
  useFormStatus,
} from "react-dom";

type Props = {
  children?: React.ReactNode;
  pendingText?: string;
  className?: string;
  disabled?: boolean;
};

/**
 * RESPONSIVE ICON/LABEL
 * ----------------------
 *
 * On mobile this collapses to a square icon-only button (h-11 w-11,
 * no horizontal padding) -- same footprint as the clear-search X
 * button next to it. From `sm:` up it grows to fit the icon +
 * "Search" label (sm:w-auto sm:px-5), matching the same
 * `hidden sm:inline` pattern already used on the "Add property"
 * button in page.tsx.
 *
 * IMPORTANT: this class carries ALL sizing/padding/width. Don't
 * pass a `className` that also sets width/height/padding (like
 * `secondaryButtonClass`) -- those would collide with the w-11 /
 * px-0 mobile sizing here and the icon could get clipped. The
 * default `colorClass` below only carries color/border/focus
 * styling for exactly this reason.
 */
const baseClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-0 sm:w-auto sm:px-5";

/**
 * Color/border/focus styling only -- deliberately excludes any
 * width, height, or padding utilities so it never conflicts with
 * `baseClass` above. Matches the look of `secondaryButtonClass`
 * from lib/ui-classes.ts, just without its layout utilities.
 */
const colorClass =
  "rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-500/10 disabled:cursor-not-allowed disabled:opacity-60";

export function SearchButton({
  children = "Search",
  pendingText = "Searching...",
  className = colorClass,
  disabled = false,
}: Props) {
  const {
    pending,
  } = useFormStatus();

  const isDisabled =
    pending ||
    disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={pending}
      className={`${baseClass} ${className}`}
    >
      {pending ? (
        <LoaderCircle
          size={16}
          aria-hidden="true"
          className="animate-spin"
        />
      ) : (
        <Search
          size={16}
          aria-hidden="true"
        />
      )}

      <span className="hidden sm:inline">
        {pending
          ? pendingText
          : children}
      </span>
    </button>
  );
}