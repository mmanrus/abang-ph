import "server-only";

import {
  AppError,
} from "@/lib/errors";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

/**
 * Require a landlord who is allowed to MODIFY data.
 *
 * SECURITY
 * --------
 *
 * requireLandlord()
 *   → authentication + landlord ownership context
 *
 * requireWritableLandlord()
 *   → authentication + landlord ownership
 *     + demo write protection
 *
 * A demo user's UI can be modified manually in DevTools.
 * Therefore hiding/disabling buttons is NOT security.
 *
 * Every mutation must still be rejected on the server.
 */
export async function requireWritableLandlord() {
  const context =
    await requireLandlord();

  if (
    context.landlord.isDemo
  ) {
    throw new AppError(
      "The Abang live demo is read-only. Create your own account to make changes.",
    );
  }

  return context;
}