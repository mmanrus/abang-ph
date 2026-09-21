"use client";

import {
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import {
  useEffect,
} from "react";

export default function AppError({
  error,
  reset,
}: {
  error:
    Error & {
      digest?: string;
    };

  reset:
    () => void;
}) {
  useEffect(
    () => {
      /**
       * This error boundary runs in the browser.
       *
       * SECURITY:
       *
       * Do not send the raw Error object to our server logger here.
       * Client errors may contain implementation details or values
       * that we do not want persisted in production logs.
       *
       * During local development, however, printing the complete
       * error to the browser console is useful for debugging.
       *
       * Later, a dedicated error-monitoring service can capture
       * browser errors safely and intentionally.
       */
      if (
        process.env.NODE_ENV !==
        "production"
      ) {
        console.error(
          "App error:",
          error,
        );
      }
    },
    [error],
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle
            size={22}
            aria-hidden="true"
          />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-zinc-950">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Abang couldn&apos;t complete this request.
          Please try again.
        </p>

        <button
          type="button"
          onClick={
            reset
          }
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white"
        >
          <RotateCcw
            size={16}
            aria-hidden="true"
          />

          Try again
        </button>
      </div>
    </div>
  );
}