/**
 * Flash Messages
 * --------------
 *
 * After successful mutations we redirect with a small code:
 *
 *   ?success=tenant-updated
 *
 * We DO NOT put arbitrary user-controlled text directly into
 * the success message.
 *
 * Bad:
 *
 *   ?successMessage=<whatever the browser sends>
 *
 * Better:
 *
 *   ?success=tenant-updated
 *
 *        ↓
 *
 * application-controlled message
 *
 * This gives us consistent wording and prevents URLs from
 * controlling arbitrary UI messages.
 */

export const FLASH_MESSAGES = {
  "expense-created":
    "Expense recorded successfully.",

  "property-updated":
    "Property updated successfully.",

  "property-archived":
    "Property archived successfully.",

  "tenant-updated":
    "Tenant information updated successfully.",

  "tenant-deactivated":
    "Tenant deactivated successfully.",

  "payment-recorded":
    "Payment recorded successfully.",

  "payment-voided":
    "Payment voided. Rent balances and collection totals were recalculated.",
  "settings-updated":
    "Business profile updated successfully.",
} as const;

export type FlashMessageCode =
  keyof typeof FLASH_MESSAGES;

/**
 * The URL is browser-controlled, so this function validates
 * the code before returning a message.
 *
 * Unknown values simply produce no banner.
 */
export function getFlashMessage(
  code: string | undefined,
) {
  if (!code) {
    return null;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      FLASH_MESSAGES,
      code,
    )
  ) {
    return FLASH_MESSAGES[
      code as FlashMessageCode
    ];
  }

  return null;
}