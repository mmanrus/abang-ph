import "server-only";

import {
  headers,
} from "next/headers";

import {
  auth,
} from "@/lib/auth";

/**
 * Returns the current Better Auth session when one exists.
 *
 * Unlike requireUser(), this helper does NOT redirect.
 *
 * Use this for pages that work for both:
 *
 * - signed-out visitors
 * - signed-in users
 *
 * Example:
 *
 * public landing page `/`
 */
export async function getOptionalSession() {
  return auth.api.getSession({
    headers:
      await headers(),
  });
}