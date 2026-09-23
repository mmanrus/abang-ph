"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAbangAdmin,
} from "@/lib/auth/require-abang-admin";

import {
  prisma,
} from "@/lib/db/prisma";

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