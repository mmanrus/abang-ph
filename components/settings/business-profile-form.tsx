"use client";

import {
  Building2,
  PhilippinePeso,
  Phone,
  Clock3,
} from "lucide-react";

import {
  useActionState,
} from "react";

import {
  updateBusinessProfileAction,
} from "@/app/(app)/settings/actions";

import {
  ActionMessage,
} from "@/components/forms/action-message";

import {
  SubmitButton,
} from "@/components/forms/submit-button";

import {
  INITIAL_ACTION_STATE,
} from "@/lib/action-state";

import {
  inputClass,
  labelClass,
  primaryButtonClass,
  selectClass,
} from "@/lib/ui-classes";

type Props = {
  profile: {
    displayName: string | null;

    phone:
      string | null;

    timezone:
      string;

    currency:
      string;
  };
};

export function BusinessProfileForm({
  profile,
}: Props) {
  const [
    state,
    action,
  ] =
    useActionState(
      updateBusinessProfileAction,

      INITIAL_ACTION_STATE,
    );

  return (
    <form
      action={action}
      className="space-y-7"
    >
      <ActionMessage
        state={state}
      />

      {/* BUSINESS IDENTITY */}
      <section>
        <div>
          <h2 className="font-semibold text-zinc-950">
            Business identity
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            This is the name shown throughout your Abang workspace.
          </p>
        </div>

        <div className="mt-5">
          <label
            htmlFor="displayName"
            className={
              labelClass
            }
          >
            Business / brand name
          </label>

          <div className="relative">
            <Building2
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              id="displayName"
              name="displayName"
              required
              maxLength={100}
              defaultValue={
                profile.displayName ?? ""
              }
              placeholder="Rusiana Rentals"
              className={[
                inputClass,
                "pl-11",
              ].join(" ")}
            />
          </div>

          <p className="mt-2 text-xs leading-5 text-zinc-500">
            Abang PH remains the software brand. This name identifies your own rental business.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section className="border-t border-zinc-100 pt-7">
        <div>
          <h2 className="font-semibold text-zinc-950">
            Contact
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            Basic contact information for your landlord account.
          </p>
        </div>

        <div className="mt-5">
          <label
            htmlFor="phone"
            className={
              labelClass
            }
          >
            Business phone
          </label>

          <div className="relative">
            <Phone
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              defaultValue={
                profile.phone ??
                ""
              }
              placeholder="09XXXXXXXXX"
              className={[
                inputClass,
                "pl-11",
              ].join(" ")}
            />
          </div>
        </div>
      </section>

      {/* REGIONAL SETTINGS */}
      <section className="border-t border-zinc-100 pt-7">
        <div>
          <h2 className="font-semibold text-zinc-950">
            Regional settings
          </h2>

          <p className="mt-1 text-sm leading-6 text-zinc-500">
            These settings affect dates and financial display throughout your workspace.
          </p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="timezone"
              className={
                labelClass
              }
            >
              Timezone
            </label>

            <div className="relative">
              <Clock3
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
              />

              <select
                id="timezone"
                name="timezone"
                defaultValue={
                  profile.timezone
                }
                className={[
                  selectClass,
                  "pl-11",
                ].join(" ")}
              >
                <option value="Asia/Manila">
                  Asia/Manila
                </option>
              </select>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              More timezone options can be added when Abang expands beyond the Philippines.
            </p>
          </div>

          <div>
            <label
              htmlFor="currency"
              className={
                labelClass
              }
            >
              Currency
            </label>

            <div className="relative">
              <PhilippinePeso
                size={17}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-zinc-400"
              />

              <select
                id="currency"
                name="currency"
                defaultValue={
                  profile.currency
                }
                className={[
                  selectClass,
                  "pl-11",
                ].join(" ")}
              >
                <option value="PHP">
                  Philippine Peso (PHP)
                </option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <div className="flex justify-end border-t border-zinc-100 pt-6">
        <SubmitButton
          pendingText="Saving profile..."
          className={
            primaryButtonClass
          }
        >
          Save business profile
        </SubmitButton>
      </div>
    </form>
  );
}