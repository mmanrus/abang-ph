import {
  Bug,
  Lightbulb,
  MessageCircle,
} from "lucide-react";

import {
  SubmitButton,
} from "@/components/forms/submit-button";

import {
  SuccessBanner,
} from "@/components/feedback/success-banner";

import {
  createFeedbackAction,
} from "./actions";

type Props = {
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function HelpPage({
  searchParams,
}: Props) {
  const query =
    await searchParams;

  return (
    <div className="
      mx-auto
      w-full
      max-w-3xl
      px-4
      py-6
      sm:px-6
      lg:px-8
      lg:py-8
    ">
      <div className="flex items-start gap-4">
        <div className="
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-emerald-50
          text-emerald-700
        ">
          <MessageCircle
            size={21}
            aria-hidden="true"
          />
        </div>

        <div>
          <h1 className="
            text-2xl
            font-semibold
            tracking-tight
            text-zinc-950
          ">
            Help & Feedback
          </h1>

          <p className="
            mt-1
            text-sm
            leading-6
            text-zinc-500
          ">
            Report a problem, suggest a feature,
            or send a support question.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SuccessBanner
          code={query.success}
        />
      </div>

      <form
        action={createFeedbackAction}
        className="
          mt-6
          space-y-6
          rounded-2xl
          border
          border-zinc-200
          bg-white
          p-5
          shadow-sm
          sm:p-6
        "
      >
        <div>
          <label
            htmlFor="type"
            className="
              mb-2
              block
              text-sm
              font-medium
              text-zinc-800
            "
          >
            What can we help with?
          </label>

          <select
            id="type"
            name="type"
            defaultValue="BUG"
            className="
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-4
              py-3
              text-sm
              outline-none
              focus:border-emerald-500
              focus:ring-4
              focus:ring-emerald-500/10
            "
          >
            <option value="BUG">
              Report a bug
            </option>

            <option value="FEATURE">
              Request a feature
            </option>

            <option value="SUPPORT">
              Ask for support
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="subject"
            className="
              mb-2
              block
              text-sm
              font-medium
              text-zinc-800
            "
          >
            Subject
          </label>

          <input
            id="subject"
            name="subject"
            required
            minLength={3}
            maxLength={120}
            placeholder="What happened?"
            className="
              w-full
              rounded-xl
              border
              border-zinc-200
              px-4
              py-3
              text-sm
              outline-none
              focus:border-emerald-500
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="
              mb-2
              block
              text-sm
              font-medium
              text-zinc-800
            "
          >
            Message
          </label>

          <textarea
            id="message"
            name="message"
            required
            minLength={10}
            maxLength={3000}
            rows={7}
            placeholder="Tell us what happened or what you'd like Abang PH to improve."
            className="
              min-h-40
              w-full
              resize-y
              rounded-xl
              border
              border-zinc-200
              px-4
              py-3
              text-sm
              leading-6
              outline-none
              focus:border-emerald-500
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />
        </div>

        <div className="
          rounded-xl
          bg-zinc-50
          p-4
        ">
          <p className="
            text-sm
            font-medium
            text-zinc-800
          ">
            Please don&apos;t include passwords
            or sensitive tenant information.
          </p>

          <p className="
            mt-1
            text-xs
            leading-5
            text-zinc-500
          ">
            If you&apos;re reporting a bug,
            describe what you were doing and
            what you expected to happen.
          </p>
        </div>

        <div className="
          flex
          justify-end
          border-t
          border-zinc-100
          pt-5
        ">
          <SubmitButton
            pendingText="Sending..."
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-600
              px-5
              py-3
              text-sm
              font-medium
              text-white
              transition
              hover:bg-emerald-700
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:w-auto
            "
          >
            Send feedback
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}