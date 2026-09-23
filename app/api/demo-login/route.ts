import {
  headers,
} from "next/headers";

import {
  auth,
} from "@/lib/auth";

import {
  prisma,
} from "@/lib/db/prisma";

export async function POST() {
  try {
    console.log(
      "[demo-login] Request received",
    );

    const requestHeaders =
      await headers();

    console.log(
      "[demo-login] Headers loaded",
    );

    const existingSession =
      await auth.api.getSession({
        headers:
          requestHeaders,
      });

    console.log(
      "[demo-login] Session checked",
    );

    if (existingSession) {
      console.log(
        "[demo-login] Existing session found",
      );

      return Response.json(
        {
          error:
            "Sign out before opening the live demo.",
        },
        {
          status: 409,

          headers: {
            "Cache-Control":
              "no-store",
          },
        },
      );
    }

    const email =
      process.env.DEMO_EMAIL
        ?.trim()
        .toLowerCase();

    const password =
      process.env.DEMO_PASSWORD;

    console.log(
      "[demo-login] Environment:",
      {
        hasEmail:
          Boolean(email),

        hasPassword:
          Boolean(password),
      },
    );

    if (
      !email ||
      !password
    ) {
      console.error(
        "[demo-login] Missing environment variables",
      );

      return demoUnavailable();
    }

    console.log(
      "[demo-login] Looking for demo user",
    );

    const user =
      await prisma.user.findUnique({
        where: {
          email,
        },

        select: {
          id: true,
        },
      });

    if (!user) {
      console.error(
        "[demo-login] Demo user not found",
      );

      return demoUnavailable();
    }

    console.log(
      "[demo-login] Demo user found",
    );

    const landlord =
      await prisma.landlordAccount.findUnique({
        where: {
          userId:
            user.id,
        },

        select: {
          isDemo:
            true,
        },
      });

    if (!landlord) {
      console.error(
        "[demo-login] Landlord account not found",
      );

      return demoUnavailable();
    }

    console.log(
      "[demo-login] Landlord found:",
      {
        isDemo:
          landlord.isDemo,
      },
    );

    if (!landlord.isDemo) {
      console.error(
        "[demo-login] Landlord is not marked as demo",
      );

      return demoUnavailable();
    }

    console.log(
      "[demo-login] Attempting Better Auth sign-in",
    );

    const response =
      await auth.api.signInEmail({
        headers:
          requestHeaders,

        body: {
          email,
          password,
        },

        asResponse:
          true,
      });

    console.log(
      "[demo-login] Sign-in successful",
    );

    return response;
  }
  catch (error) {
    console.error(
      "[demo-login] UNEXPECTED ERROR:",
      error instanceof Error
        ? {
            name:
              error.name,

            message:
              error.message,
          }
        : "Unknown error",
    );

    return demoUnavailable();
  }
}

function demoUnavailable() {
  return Response.json(
    {
      error:
        "The live demo is temporarily unavailable.",
    },
    {
      status: 503,

      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}