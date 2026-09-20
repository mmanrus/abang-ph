import "server-only";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  AppError,
} from "@/lib/errors";

/**
 * SettingsService
 * ---------------
 *
 * Handles landlord/business-level settings.
 *
 * IMPORTANT SECURITY RULE:
 *
 * The user never sends us:
 *
 *   landlordAccountId = "whatever"
 *
 * as an authoritative value.
 *
 * The Server Action gets landlordAccountId from
 * requireLandlord(), which derives it from the
 * authenticated session.
 *
 * That keeps one landlord from editing another
 * landlord's business profile.
 */

type UpdateBusinessProfileInput = {
  landlordAccountId: string;

  displayName: string;

  phone?: string | null;

  timezone: string;

  currency: string;
};

/**
 * For Abang V1 we intentionally keep these restricted.
 *
 * WHY?
 *
 * Abang is initially built specifically for Philippine
 * landlords, and much of our date/money behavior assumes:
 *
 *   PHP
 *   Asia/Manila
 *
 * Supporting arbitrary currencies/timezones properly would
 * affect billing dates, reports, money formatting, and other
 * business logic.
 *
 * So we avoid pretending we support something we don't.
 */
const supportedTimezones = [
  "Asia/Manila",
] as const;

const supportedCurrencies = [
  "PHP",
] as const;

export async function updateBusinessProfile(
  input: UpdateBusinessProfileInput,
) {
  const displayName =
    input.displayName.trim();

  if (!displayName) {
    throw new AppError(
      "Business name is required.",
    );
  }

  if (
    displayName.length >
    100
  ) {
    throw new AppError(
      "Business name is too long.",
    );
  }

  const phone =
    input.phone?.trim() ||
    null;

  /**
   * WHITELIST VALIDATION
   *
   * Even though the form uses a select,
   * HTTP requests can be manually modified.
   *
   * Therefore the service validates values again.
   */
  if (
    !supportedTimezones.includes(
      input.timezone as
        (typeof supportedTimezones)[number],
    )
  ) {
    throw new AppError(
      "Unsupported timezone.",
    );
  }

  if (
    !supportedCurrencies.includes(
      input.currency as
        (typeof supportedCurrencies)[number],
    )
  ) {
    throw new AppError(
      "Unsupported currency.",
    );
  }

  /**
   * updateMany() lets us keep ownership directly
   * inside the update condition.
   *
   * If this landlord ID doesn't exist:
   *
   * result.count = 0
   *
   * Nothing else gets modified.
   */
  const result =
    await prisma.landlordAccount.updateMany({
      where: {
        id:
          input.landlordAccountId,
      },

      data: {
        displayName,

        phone,

        timezone:
          input.timezone,

        currency:
          input.currency,
      },
    });

  if (
    result.count !== 1
  ) {
    throw new AppError(
      "Business profile not found.",
    );
  }
}