import {
  betterAuth,
} from "better-auth";

import {
  prismaAdapter,
} from "better-auth/adapters/prisma";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  validateServerEnvironment,
} from "@/lib/env";

/**
 * Fail early when critical server configuration
 * is missing or unsafe.
 */
validateServerEnvironment();

export const auth =
  betterAuth({
    database:
      prismaAdapter(
        prisma,
        {
          provider:
            "postgresql",
        },
      ),

    emailAndPassword: {
      enabled: true,
    },
    rateLimit: {
      /**
       * Enable Better Auth's built-in request rate limiter
       * explicitly instead of relying on production defaults.
       */
      enabled: true,

      /**
       * IMPORTANT:
       *
       * Vercel can execute requests on multiple server instances.
       * An in-memory rate limiter would give each instance its
       * own counter.
       *
       * Database storage keeps the counters in PostgreSQL so
       * all instances share the same rate-limit state.
       */
      storage:
        "database",
    },
  });