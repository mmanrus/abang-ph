"use client";

import {
  Eye,
  LoaderCircle,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

export function DemoLoginButton() {
  const router =
    useRouter();

  const [
    pending,
    setPending,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  async function handleDemoLogin() {
    if (pending) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/demo-login",
          {
            method:
              "POST",

            credentials:
              "same-origin",
          },
        );

      if (!response.ok) {
        const body =
          await response
            .json()
            .catch(
              () =>
                null,
            );

        setError(
          body?.error ??
            "The live demo is temporarily unavailable.",
        );

        return;
      }

      /**
       * replace() is preferable here so pressing Back
       * doesn't immediately return to a stale login state.
       */
      router.replace(
        "/dashboard",
      );

      router.refresh();
    }
    catch {
      setError(
        "The live demo is temporarily unavailable.",
      );
    }
    finally {
      setPending(false);
    }
  }

  return (
    <div className="w-full sm:w-auto">
      <button
        type="button"
        onClick={
          handleDemoLogin
        }
        disabled={
          pending
        }
        aria-busy={
          pending
        }
        className="
          inline-flex
          min-h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          border
          border-zinc-200
          bg-white
          px-6
          text-sm
          font-medium
          text-zinc-700
          transition
          hover:bg-zinc-50
          disabled:cursor-not-allowed
          disabled:opacity-60
          sm:w-auto
        "
      >
        {pending ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Eye
            size={17}
            aria-hidden="true"
          />
        )}

        {pending
          ? "Opening demo..."
          : "View live demo"}
      </button>

      {error && (
        <p
          className="
            mt-2
            text-sm
            leading-5
            text-red-600
          "
        >
          {error}
        </p>
      )}
    </div>
  );
}