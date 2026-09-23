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
 * "Search" label.
 *
 * IMPORTANT: this component is specifically for SEARCH buttons next
 * to a search field (Properties page, pickers). It is NOT a
 * general-purpose submit button -- an action like "Generate rent
 * charges" needs its label visible at every width, not collapsed
 * to an icon on mobile. Use SubmitButton (components/forms/submit-button.tsx)
 * for that instead. Bolting a "hide my own icon/label" flag onto
 * this component to repurpose it for non-search actions is exactly
 * what caused the broken "Generate" button on /rent -- don't
 * reintroduce that.
 */
const baseClass =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap px-0 sm:w-auto sm:px-5";

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