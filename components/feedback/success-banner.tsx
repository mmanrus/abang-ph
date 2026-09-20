"use client";

import {
  CheckCircle2,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  getFlashMessage,
} from "@/lib/flash-messages";

type Props = {
  code?: string;
};

export function SuccessBanner({
  code,
}: Props) {
  const [
    visible,
    setVisible,
  ] =
    useState(true);

  const message =
    getFlashMessage(
      code,
    );

  /**
   * Unknown code?
   *
   * Render nothing.
   *
   * This keeps browser-controlled query parameters from
   * becoming arbitrary messages inside the application.
   */
  if (
    !message ||
    !visible
  ) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-800"
    >
      <CheckCircle2
        size={20}
        className="mt-0.5 shrink-0"
      />

      <p className="min-w-0 flex-1 text-sm font-medium leading-6">
        {message}
      </p>

      <button
        type="button"
        onClick={() =>
          setVisible(
            false,
          )
        }
        aria-label="Dismiss success message"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-700 transition hover:bg-emerald-100"
      >
        <X
          size={16}
        />
      </button>
    </div>
  );
}