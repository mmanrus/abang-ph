import {
  redirect,
} from "next/navigation";

import {
  getOptionalSession,
} from "@/lib/auth/get-session";

/**
 * AUTH ROUTE GUARD
 * ----------------
 *
 * A signed-in user should not normally return to:
 *
 * /login
 * /register
 *
 * The session check happens on the server before the
 * authentication page is rendered.
 *
 * This is stronger than merely hiding links in the UI.
 */
export default async function AuthLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const session =
    await getOptionalSession();

  if (session) {
    redirect(
      "/dashboard",
    );
  }

  return children;
}