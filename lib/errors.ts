/**
 * AppError
 * --------
 *
 * Represents an error that is SAFE to show directly to a user.
 *
 * Example:
 *
 *   "Payment exceeds the remaining balance."
 *   "Property not found."
 *   "Monthly rent must be greater than zero."
 *
 * Those are business-rule messages and are safe to display.
 *
 * We DO NOT want to accidentally show raw database errors like:
 *
 *   PrismaClientKnownRequestError...
 *   relation "Payment" does not exist...
 *   connection refused...
 *
 * Those messages can expose implementation details.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "AppError";
  }
}

/**
 * Converts an unknown server error into something safe for the UI.
 *
 * SECURITY:
 *
 * Known AppError:
 *      ↓
 * show actual message
 *
 * Unknown error:
 *      ↓
 * log it on server
 *      ↓
 * show generic message
 *
 * This prevents sensitive infrastructure/database information
 * from leaking into the browser.
 */
export function getUserSafeErrorMessage(
  error: unknown,
) {
  if (error instanceof AppError) {
    return error.message;
  }

  console.error(
    "Unexpected application error:",
    error,
  );

  return "Something went wrong. Please try again.";
}