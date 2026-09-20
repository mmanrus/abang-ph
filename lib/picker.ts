/**
 * Serializable data shared between the picker service,
 * Server Actions, and Client Component.
 *
 * Keep this plain:
 *
 * - strings
 * - numbers
 * - arrays
 *
 * No Prisma Decimal, BigInt, Date, or database objects cross
 * the Server → Client boundary.
 */

export const PICKER_PAGE_SIZE =
  8;

export type PickerOption = {
  id: string;

  title: string;

  subtitle?: string;

  details?: string[];

  badge?: string;
};

export type PickerResult = {
  items:
    PickerOption[];

  page: number;

  totalPages:
    number;

  totalItems:
    number;
};