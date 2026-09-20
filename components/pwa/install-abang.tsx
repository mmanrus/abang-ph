"use client";

import {
  Download,
  MonitorDown,
  Share,
  Smartphone,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

/**
 * Chromium exposes this event when the PWA satisfies its
 * installation requirements.
 *
 * It is not part of the normal TypeScript DOM definitions,
 * so we describe only the fields Abang actually uses.
 */
type BeforeInstallPromptEvent =
  Event & {
    prompt:
      () =>
        Promise<void>;

    userChoice:
      Promise<{
        outcome:
          | "accepted"
          | "dismissed";

        platform:
          string;
      }>;
  };

type InstallInstructions =
  | "ios"
  | "generic";

type Props = {
  /**
   * compact = simple button
   * card    = full install card
   */
  variant?:
    "compact" | "card";
};

export function InstallAbang({
  variant = "card",
}: Props) {
  const [
    deferredPrompt,
    setDeferredPrompt,
  ] =
    useState<
      BeforeInstallPromptEvent | null
    >(null);

  const [
    instructions,
    setInstructions,
  ] =
    useState<
      InstallInstructions | null
    >(null);

  const [
    installed,
    setInstalled,
  ] =
    useState(false);

  /**
   * INSTALL EVENTS
   * --------------
   *
   * Notice that we don't immediately call setState from the
   * effect body.
   *
   * State updates happen from browser event callbacks.
   *
   * This also keeps us clear of the
   * react-hooks/set-state-in-effect lint rule we encountered
   * earlier in AppNavigation.
   */
  useEffect(
    () => {
      function handleBeforeInstallPrompt(
        event: Event,
      ) {
        /**
         * Prevent Chrome from immediately displaying its own
         * prompt.
         *
         * We save the event so the user can choose when to
         * install Abang.
         */
        event.preventDefault();

        setDeferredPrompt(
          event as
            BeforeInstallPromptEvent,
        );
      }

      function handleInstalled() {
        setInstalled(
          true,
        );

        setDeferredPrompt(
          null,
        );
      }

      window.addEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );

      window.addEventListener(
        "appinstalled",
        handleInstalled,
      );

      return () => {
        window.removeEventListener(
          "beforeinstallprompt",
          handleBeforeInstallPrompt,
        );

        window.removeEventListener(
          "appinstalled",
          handleInstalled,
        );
      };
    },
    [],
  );

  function isIOSDevice() {
    const userAgent =
      navigator.userAgent;

    const normalIOS =
      /iPad|iPhone|iPod/i.test(
        userAgent,
      );

    /**
     * Newer iPads may identify themselves as a Mac.
     */
    const ipadPretendingToBeMac =
      navigator.platform ===
        "MacIntel" &&
      navigator.maxTouchPoints >
        1;

    return (
      normalIOS ||
      ipadPretendingToBeMac
    );
  }

  async function handleInstall() {
    /**
     * Chromium / Edge / Android install prompt.
     */
    if (
      deferredPrompt
    ) {
      await deferredPrompt.prompt();

      const choice =
        await deferredPrompt.userChoice;

      /**
       * The saved event can only be used once.
       */
      setDeferredPrompt(
        null,
      );

      if (
        choice.outcome ===
        "accepted"
      ) {
        setInstalled(
          true,
        );
      }

      return;
    }

    /**
     * Safari does not expose beforeinstallprompt.
     *
     * We therefore provide instructions instead.
     */
    setInstructions(
      isIOSDevice()
        ? "ios"
        : "generic",
    );
  }

  /**
   * Once installation completes in the current browser,
   * there's no reason to keep showing the CTA.
   *
   * The CSS class `pwa-install-only` also hides it when the
   * app is actually running in standalone mode.
   */
  if (installed) {
    return null;
  }

  return (
    <>
      {variant ===
      "compact" ? (
        <button
          type="button"
          onClick={
            handleInstall
          }
          className="pwa-install-only inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/10"
        >
          <Download
            size={17}
            aria-hidden="true"
          />

          Install Abang PH
        </button>
      ) : (
        <section className="pwa-install-only rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <MonitorDown
                size={21}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-zinc-950">
                Install Abang PH
              </h2>

              <p className="mt-1 text-sm leading-6 text-zinc-500">
                Add Abang to your device for quicker access and an app-like experience.
              </p>

              <button
                type="button"
                onClick={
                  handleInstall
                }
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
              >
                <Download
                  size={17}
                  aria-hidden="true"
                />

                Install Abang PH
              </button>
            </div>
          </div>
        </section>
      )}

      {instructions && (
        <InstallInstructionsModal
          kind={
            instructions
          }
          onClose={() =>
            setInstructions(
              null,
            )
          }
        />
      )}
    </>
  );
}

function InstallInstructionsModal({
  kind,
  onClose,
}: {
  kind:
    InstallInstructions;

  onClose:
    () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-abang-title"
        className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Smartphone
              size={21}
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label="Close install instructions"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-100"
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>

        <h2
          id="install-abang-title"
          className="mt-5 text-xl font-semibold text-zinc-950"
        >
          Install Abang PH
        </h2>

        {kind ===
        "ios" ? (
          <>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              On iPhone or iPad, install Abang from Safari:
            </p>

            <ol className="mt-5 space-y-4">
              <InstructionStep
                number={1}
              >
                Open Abang PH in Safari.
              </InstructionStep>

              <InstructionStep
                number={2}
                icon={
                  <Share
                    size={16}
                    aria-hidden="true"
                  />
                }
              >
                Tap the Share button.
              </InstructionStep>

              <InstructionStep
                number={3}
              >
                Choose <strong>Add to Home Screen</strong>.
              </InstructionStep>

              <InstructionStep
                number={4}
              >
                Tap <strong>Add</strong>.
              </InstructionStep>
            </ol>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Your browser did not expose the automatic install prompt.
            </p>

            <p className="mt-4 text-sm leading-6 text-zinc-600">
              Open your browser menu and look for an option such as:
            </p>

            <div className="mt-4 space-y-2 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-700">
              <p>
                • Install Abang PH
              </p>

              <p>
                • Install app
              </p>

              <p>
                • Add to Home Screen
              </p>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={
            onClose
          }
          className="mt-6 min-h-11 w-full rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function InstructionStep({
  number,
  icon,
  children,
}: {
  number:
    number;

  icon?:
    React.ReactNode;

  children:
    React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700">
        {icon ??
          number}
      </span>

      <p className="pt-1 text-sm leading-6 text-zinc-700">
        {children}
      </p>
    </li>
  );
}