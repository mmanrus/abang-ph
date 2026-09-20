/**
 * Pagination utilities
 * --------------------
 *
 * Pagination should happen at the database level.
 *
 * BAD:
 *
 *   fetch 2,000 tenants
 *      ↓
 *   JavaScript slices 20
 *
 * The database still transferred 2,000 records.
 *
 * GOOD:
 *
 *   PostgreSQL
 *      ↓
 *   SKIP 20
 *   TAKE 20
 *
 * Only the rows needed for the current page are returned.
 */

export const PAGE_SIZE =
  20;

export function parsePage(
  value:
    string | undefined,
) {
  const page =
    Number(value);

  if (
    !Number.isInteger(
      page,
    ) ||
    page < 1
  ) {
    return 1;
  }

  return page;
}

export function getTotalPages(
  totalRecords: number,
  pageSize =
    PAGE_SIZE,
) {
  return Math.max(
    1,

    Math.ceil(
      totalRecords /
        pageSize,
    ),
  );
}

export function getSkip(
  page: number,
  pageSize =
    PAGE_SIZE,
) {
  return (
    (page - 1) *
    pageSize
  );
}