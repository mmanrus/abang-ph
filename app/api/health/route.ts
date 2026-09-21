import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  logger,
} from "@/lib/logger";

/**
 * Health endpoint
 * ---------------
 *
 * Used by production monitoring to answer:
 *
 *   1. Is the Abang application responding?
 *   2. Can Abang reach PostgreSQL?
 *
 * SECURITY:
 *
 * We intentionally return only:
 *
 *   { status: "ok" }
 *
 * or:
 *
 *   { status: "unhealthy" }
 *
 * We never expose:
 * - database errors
 * - connection strings
 * - host names
 * - Prisma messages
 * - stack traces
 */
export async function GET() {
  try {
    /**
     * A tiny query verifies that our application
     * can actually communicate with PostgreSQL.
     *
     * This is stronger than merely returning 200
     * from the Next.js server.
     */
    await prisma.$queryRaw`
      SELECT 1
    `;

    return NextResponse.json(
      {
        status:
          "ok",
      },
      {
        status:
          200,

        headers: {
          /**
           * A monitoring service must receive the
           * current health state, never a cached response.
           */
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
  catch {
    logger.error(
      "health_check_failed",
      "Database health check failed.",
    );

    return NextResponse.json(
      {
        status:
          "unhealthy",
      },
      {
        status:
          503,

        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate",
        },
      },
    );
  }
}