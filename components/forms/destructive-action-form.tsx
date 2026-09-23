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
import { dangerButtonClass } from "@/lib/ui-classes";

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
        className={dangerButtonClass}
      >
        {label}
      </SubmitButton>
    </form>
  );
}