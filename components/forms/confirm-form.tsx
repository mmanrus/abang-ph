"use client";

import {
  ReactNode,
} from "react";

type Props = {
  action:
    (
      formData:
        FormData,
    ) =>
      void |
      Promise<void>;

  message:
    string;

  children:
    ReactNode;

  className?:
    string;
};

export function ConfirmForm({
  action,
  message,
  children,
  className,
}: Props) {
  return (
    <form
      action={action}
      className={
        className
      }
      onSubmit={(
        event,
      ) => {
        /**
         * This confirmation is UX protection.
         *
         * It is NOT security.
         *
         * A crafted request can bypass this dialog,
         * so authorization and validation still happen
         * inside the Server Action + Service.
         */
        const confirmed =
          window.confirm(
            message,
          );

        if (
          !confirmed
        ) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}