"use client";

import {
  ReactNode,
  useActionState,
} from "react";

import {
  ActionState,
  INITIAL_ACTION_STATE,
} from "@/lib/action-state";

import {
  ActionMessage,
} from "@/components/forms/action-message";

import {
  SubmitButton,
} from "@/components/forms/submit-button";

type Action = (
  previousState:
    ActionState,

  formData:
    FormData,
) => Promise<ActionState>;

type Props = {
  action:
    Action;

  confirmMessage:
    string;

  label:
    string;

  pendingText?:
    string;

  children?:
    ReactNode;
};

export function DestructiveActionForm({
  action,
  confirmMessage,
  label,
  pendingText =
    "Working...",
  children,
}: Props) {
  const [
    state,
    formAction,
  ] =
    useActionState(
      action,

      INITIAL_ACTION_STATE,
    );

  return (
    <form
      action={
        formAction
      }
      className="space-y-3"
      onSubmit={(
        event,
      ) => {
        /**
         * Again:
         *
         * confirmation = UX safety
         *
         * service authorization/business rules
         * = actual data safety
         */
        if (
          !window.confirm(
            confirmMessage,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <ActionMessage
        state={state}
      />

      {children}

      <SubmitButton
        pendingText={
          pendingText
        }
        className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        {label}
      </SubmitButton>
    </form>
  );
}