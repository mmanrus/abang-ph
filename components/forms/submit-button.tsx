"use client";

import {
  LoaderCircle,
} from "lucide-react";

import {
  useFormStatus,
} from "react-dom";

type Props = {
  children:
    React.ReactNode;

  pendingText?: string;

  className?: string;

  disabled?: boolean;
};

export function SubmitButton({
  children,
  pendingText =
    "Saving...",
  className,
  disabled = false,
}: Props) {
  const {
    pending,
  } =
    useFormStatus();

  const isDisabled =
    pending ||
    disabled;

  return (
    <button
      type="submit"
      disabled={
        isDisabled
      }
      aria-disabled={
        isDisabled
      }
      aria-busy={
        pending
      }
      className={
        className
      }
    >
      {pending && (
        <LoaderCircle
          size={16}
          aria-hidden="true"
          className="animate-spin"
        />
      )}

      {pending
        ? pendingText
        : children}
    </button>
  );
}