import "server-only";

/**
 * Server Environment Validation
 * -----------------------------
 *
 * IMPORTANT:
 *
 * Next.js sets:
 *
 *   NODE_ENV=production
 *
 * during `next build`, even when we are building locally.
 *
 * Therefore NODE_ENV alone cannot tell us whether Abang is
 * actually running as the deployed production application.
 *
 * We use APP_ENV for that distinction:
 *
 *   APP_ENV=development
 *   APP_ENV=production
 */

function requiredEnvironmentVariable(
  name: string,
) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}`,
    );
  }

  return value;
}

function validateUrl(
  name: string,
  value: string,
) {
  try {
    return new URL(
      value,
    );
  } catch {
    throw new Error(
      `${name} must be a valid URL.`,
    );
  }
}

const supportedAppEnvironments = [
  "development",
  "production",
] as const;

type AppEnvironment =
  (typeof supportedAppEnvironments)[number];

export function validateServerEnvironment() {
  const appEnv =
    requiredEnvironmentVariable(
      "APP_ENV",
    );

  /**
   * Explicitly whitelist environments.
   *
   * This prevents typos such as:
   *
   * APP_ENV=prodution
   */
  if (
    !supportedAppEnvironments.includes(
      appEnv as AppEnvironment,
    )
  ) {
    throw new Error(
      "APP_ENV must be either development or production.",
    );
  }

  const databaseUrl =
    requiredEnvironmentVariable(
      "DATABASE_URL",
    );

  const betterAuthSecret =
    requiredEnvironmentVariable(
      "BETTER_AUTH_SECRET",
    );

  const betterAuthUrl =
    requiredEnvironmentVariable(
      "BETTER_AUTH_URL",
    );

  /**
   * AUTH SECRET SAFETY
   * ------------------
   *
   * Don't allow obviously weak secrets.
   */
  if (
    betterAuthSecret.length <
    32
  ) {
    throw new Error(
      "BETTER_AUTH_SECRET must contain at least 32 characters.",
    );
  }

  const authUrl =
    validateUrl(
      "BETTER_AUTH_URL",
      betterAuthUrl,
    );

  const isProduction =
    appEnv ===
    "production";

  /**
   * REAL PRODUCTION SAFETY
   * ----------------------
   *
   * Only the actual deployed production environment
   * requires HTTPS here.
   *
   * A local `next build` is still allowed to use:
   *
   * http://localhost:3000
   */
  if (
    isProduction &&
    authUrl.protocol !==
      "https:"
  ) {
    throw new Error(
      "BETTER_AUTH_URL must use HTTPS in production.",
    );
  }

  if (
    isProduction &&
    (
      authUrl.hostname ===
        "localhost" ||
      authUrl.hostname ===
        "127.0.0.1"
    )
  ) {
    throw new Error(
      "BETTER_AUTH_URL cannot use localhost in production.",
    );
  }

  return {
    appEnv:
      appEnv as AppEnvironment,

    databaseUrl,

    betterAuthSecret,

    betterAuthUrl,
  };
}