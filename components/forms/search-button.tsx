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

export function SearchButton({
  children = "Search",
  pendingText = "Searching...",
  className,
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
      className={className}
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

      {pending
        ? pendingText
        : children}
    </button>
  );
}