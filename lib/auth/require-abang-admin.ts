import "server-only";

import {
  notFound,
} from "next/navigation";

import {
  requireUser,
} from "@/lib/auth/require-user";

/**
 * ABANG PLATFORM ADMIN AUTHORIZATION
 * ----------------------------------
 *
 * This is different from requireLandlord().
 *
 * requireLandlord()
 *   → protects a landlord's own rental data.
 *
 * requireAbangAdmin()
 *   → protects Abang's internal platform tools.
 *
 * SECURITY:
 * Never trust an email/user ID sent from the browser.
 * We always get the authenticated user from Better Auth
 * on the server first.
 */
const ADMIN_EMAILS =
  new Set([
    "mmanrusiana@gmail.com",
  ]);

export async function requireAbangAdmin() {
  /**
   * requireUser() guarantees that we have an
   * authenticated user.
   *
   * This also removes the:
   *
   * "session is possibly null"
   *
   * TypeScript problem.
   */
  const user =
    await requireUser();

  const email =
    user.email
      .trim()
      .toLowerCase();

  if (
    !ADMIN_EMAILS.has(
      email,
    )
  ) {
    /**
     * We deliberately return a 404 instead of:
     *
     * "You are not an admin"
     *
     * This avoids exposing the existence of
     * internal platform routes to normal users.
     */
    notFound();
  }

  return {
    user,
  };
}