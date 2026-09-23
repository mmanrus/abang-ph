"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAbangAdmin,
} from "@/lib/auth/require-abang-admin";

import {
  AppError,
} from "@/lib/errors";

import {
  prisma,
} from "@/lib/db/prisma";

export async function replyToFeedbackAction(
  feedbackId: string,
  formData: FormData,
) {
  await requireAbangAdmin();

  const message =
    String(
      formData.get("message") ?? "",
    ).trim();

  if (
    message.length < 2 ||
    message.length > 3000
  ) {
    throw new AppError(
      "Reply must be between 2 and 3000 characters.",
    );
  }

  /**
   * SECURITY:
   *
   * We never trust a landlord ID or admin identity
   * sent from the browser.
   *
   * The admin authorization comes from the
   * authenticated server session above.
   */

  const feedback =
    await prisma.feedback.findUnique({
      where: {
        id: feedbackId,
      },

      select: {
        id: true,
      },
    });

  if (!feedback) {
    throw new AppError(
      "Feedback could not be found.",
    );
  }

  await prisma.feedbackReply.create({
    data: {
      feedbackId:
        feedback.id,

      authorType:
        "ADMIN",

      message,
    },
  });

  revalidatePath(
    `/admin/feedback/${feedbackId}`,
  );
}


const VALID_STATUSES = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "CLOSED",
] as const;

type FeedbackStatus =
  typeof VALID_STATUSES[number];
  
export async function updateFeedbackStatusAction(
  feedbackId: string,
  formData: FormData,
) {
  await requireAbangAdmin();

  const status =
    String(
      formData.get("status") ?? "",
    ) as FeedbackStatus;

  if (
    !VALID_STATUSES.includes(
      status,
    )
  ) {
    throw new Error(
      "Invalid feedback status.",
    );
  }

  await prisma.feedback.update({
    where: {
      id: feedbackId,
    },

    data: {
      status,
    },
  });

  revalidatePath(
    "/admin/feedback",
  );

  revalidatePath(
    "/admin",
  );
}