import "server-only";

type LogLevel =
  | "info"
  | "warn"
  | "error";

type LogValue =
  | string
  | number
  | boolean
  | null
  | undefined;

type LogMetadata =
  Record<
    string,
    LogValue
  >;

/**
 * Keys that should never be written into production logs.
 *
 * Logging is useful for debugging, but logs can live much longer
 * than a normal HTTP request. Treat logs as sensitive storage.
 */
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "session",
  "sessionToken",
  "cookie",
  "authorization",
  "secret",
  "databaseUrl",
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
]);

function sanitizeMetadata(
  metadata?: LogMetadata,
) {
  if (!metadata) {
    return undefined;
  }

  const safeMetadata:
    LogMetadata = {};

  for (
    const [
      key,
      value,
    ] of Object.entries(metadata)
  ) {
    if (
      SENSITIVE_KEYS.has(key)
    ) {
      safeMetadata[key] =
        "[REDACTED]";

      continue;
    }

    safeMetadata[key] =
      value;
  }

  return safeMetadata;
}

function writeLog(
  level: LogLevel,
  event: string,
  message: string,
  metadata?: LogMetadata,
) {
  const entry = {
    timestamp:
      new Date().toISOString(),

    level,

    event,

    message,

    environment:
      process.env.APP_ENV ??
      "development",

    ...sanitizeMetadata(
      metadata,
    ),
  };

  const serialized =
    JSON.stringify(entry);

  switch (level) {
    case "error":
      console.error(serialized);
      break;

    case "warn":
      console.warn(serialized);
      break;

    default:
      console.log(serialized);
  }
}

export const logger = {
  info(
    event: string,
    message: string,
    metadata?: LogMetadata,
  ) {
    writeLog(
      "info",
      event,
      message,
      metadata,
    );
  },

  warn(
    event: string,
    message: string,
    metadata?: LogMetadata,
  ) {
    writeLog(
      "warn",
      event,
      message,
      metadata,
    );
  },

  error(
    event: string,
    message: string,
    metadata?: LogMetadata,
  ) {
    writeLog(
      "error",
      event,
      message,
      metadata,
    );
  },
};