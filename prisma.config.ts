import "dotenv/config";

import {
  defineConfig,
} from "prisma/config";

/**
 * Prisma CLI database selection
 * -----------------------------
 *
 * Application runtime:
 *
 *   DATABASE_URL
 *
 * Migrations:
 *
 *   DIRECT_DATABASE_URL
 *
 * If no direct URL exists (for example during local
 * development), Prisma falls back to DATABASE_URL.
 *
 * IMPORTANT:
 *
 * This file configures Prisma CLI commands such as:
 *
 *   prisma migrate deploy
 *   prisma migrate status
 *
 * Our runtime Prisma client still reads DATABASE_URL in
 * lib/db/prisma.ts.
 */

const databaseUrl =
  process.env
    .DIRECT_DATABASE_URL ??
  process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL or DIRECT_DATABASE_URL must be defined.",
  );
}

export default defineConfig({
  schema:
    "prisma/schema.prisma",

  migrations: {
    path:
      "prisma/migrations",

    seed:
      "tsx prisma/seed.ts",
  },

  datasource: {
    url:
      databaseUrl,
  },
});