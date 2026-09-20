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
  });