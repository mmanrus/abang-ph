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
      digest?:
        string;
    };

  reset:
    () => void;
}) {
  useEffect(
    () => {
      /**
       * Developers still need the full technical error.
       *
       * In production this could later go to:
       *
       * Sentry
       * OpenTelemetry
       * another monitoring service
       */
      console.error(
        error,
      );
    },
    [error],
  );

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle
            size={22}
          />
        </div>

        <h1 className="mt-5 text-xl font-semibold text-zinc-950">
          Something went wrong
        </h1>

        <p className="mt-2 text-sm leading-6 text-zinc-500">
          Abang couldn&apos;t complete this request.
          Your existing data has not been intentionally removed.
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
          />

          Try again
        </button>
      </div>
    </div>
  );
}