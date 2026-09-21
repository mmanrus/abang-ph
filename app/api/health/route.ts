import {
  NextResponse,
} from "next/server";

import {
  prisma,
} from "@/lib/db/prisma";

/**
 * Production health endpoint
 * --------------------------
 *
 * Used to answer:
 *
 *   Is the Next.js server running?
 *   Can it reach PostgreSQL?
 *
 * SECURITY:
 *
 * We NEVER return raw database errors.
 *
 * Internal:
 *
 *   connection refused
 *   credentials invalid
 *   timeout
 *
 * External response:
 *
 *   unhealthy
 */

import {
  logger,
} from "@/lib/logger";

export async function GET() {
  try {
    await prisma.$queryRaw`
      SELECT 1
    `;

    return NextResponse.json({
      status:
        "ok",
    });
  }
  catch {
    logger.error(
      "health_check_failed",
      "Database health check failed",
    );

    return NextResponse.json(
      {
        status:
          "unhealthy",
      },
      {
        status:
          503,
      },
    );
  }
}