/**
 * Standard result returned by interactive Server Actions.
 *
 * Instead of:
 *
 *   throw Error
 *      ↓
 *   Next.js error page 😭
 *
 * normal validation errors become:
 *
 *   {
 *     status: "error",
 *     message: "Amount must be greater than zero."
 *   }
 *
 * Unexpected errors can still reach app/error.tsx.
 */

export type ActionState = {
  status:
    | "idle"
    | "error"
    | "success";

  message?: string;
};

export const INITIAL_ACTION_STATE: ActionState = {
  status: "idle",
};