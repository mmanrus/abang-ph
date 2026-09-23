"use server";

import {
  redirect,
} from "next/navigation";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  createFeedback,
} from "@/server/services/feedback.service";
import { requireWritableLandlord } from "@/lib/auth/require-writable-landlord";

export async function createFeedbackAction(
  formData: FormData,
) {
  const {
    landlord,
  } =
    await requireWritableLandlord();

  const type =
    String(
      formData.get("type") ?? "",
    );

  const subject =
    String(
      formData.get("subject") ?? "",
    );

  const message =
    String(
      formData.get("message") ?? "",
    );

  const page =
    String(
      formData.get("page") ?? "",
    );

  await createFeedback({
    landlordAccountId:
      landlord.id,

    type:
      type as
        | "BUG"
        | "FEATURE"
        | "SUPPORT",

    subject,

    message,

    page:
      page || null,
  });

  redirect(
    "/help?success=feedback_sent",
  );
}