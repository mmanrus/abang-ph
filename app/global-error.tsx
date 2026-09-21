"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";

import {
  useEffect,
} from "react";

export default function GlobalError({
  error,
}: {
  error:
    Error & {
      digest?: string;
    };
}) {
  useEffect(
    () => {
      /**
       * Create a safe replacement error.
       *
       * We preserve stack FRAME locations but replace the first
       * stack line because it normally contains the original
       * exception message.
       */
      const sanitizedError =
        new Error(
          "Unhandled client application error.",
        );

      const stackFrames =
        error.stack
          ?.split("\n")
          .slice(1)
          .join("\n");

      if (stackFrames) {
        sanitizedError.stack =
          [
            `${sanitizedError.name}: ${sanitizedError.message}`,
            stackFrames,
          ].join("\n");
      }

      Sentry.captureException(
        sanitizedError,
        {
          tags: {
            boundary:
              "global-error",
          },
        },
      );
    },
    [error],
  );

  return (
    <html lang="en">
      <body>
        <NextError
          statusCode={0}
        />
      </body>
    </html>
  );
}