import "server-only";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  AppError,
} from "@/lib/errors";

type FeedbackType =
  | "BUG"
  | "FEATURE"
  | "SUPPORT";

type CreateFeedbackInput = {
  landlordAccountId: string;
  type: FeedbackType;
  subject: string;
  message: string;
  page?: string | null;
};

/**
 * FEEDBACK SERVICE
 * ----------------
 *
 * SECURITY:
 * The landlordAccountId must come from the authenticated
 * server session/action — never from a hidden form field.
 *
 * This prevents a user from submitting feedback as another
 * landlord by changing browser form data.
 *
 * VALIDATION:
 * We validate again on the server because browser-side
 * validation can always be bypassed.
 */
export async function createFeedback(
  input: CreateFeedbackInput,
) {
  const subject =
    input.subject.trim();

  const message =
    input.message.trim();

  const page =
    input.page?.trim() || null;

  if (
    ![
      "BUG",
      "FEATURE",
      "SUPPORT",
    ].includes(input.type)
  ) {
    throw new AppError(
      "Choose a valid feedback type.",
    );
  }

  if (
    subject.length < 3 ||
    subject.length > 120
  ) {
    throw new AppError(
      "Subject must be between 3 and 120 characters.",
    );
  }

  if (
    message.length < 10 ||
    message.length > 3000
  ) {
    throw new AppError(
      "Message must be between 10 and 3000 characters.",
    );
  }

  return prisma.feedback.create({
    data: {
      landlordAccountId:
        input.landlordAccountId,

      type:
        input.type,

      subject,

      message,

      page,
    },
  });
}