/**
 * Utilities for working with rental billing periods.
 *
 * WHY A SEPARATE LIBRARY?
 * -----------------------
 * Pages, server actions, reports, and future background jobs
 * will all need to understand values such as:
 *
 *   2026-09
 *
 * Keeping this logic in one place prevents every feature from
 * implementing month calculations differently.
 */

export type RentPeriod = {
  year: number;
  month: number;
};

/**
 * Parses:
 *
 *   "2026-09"
 *
 * into:
 *
 *   { year: 2026, month: 9 }
 *
 * We validate instead of trusting URL/search-param data because
 * anything coming from the browser is untrusted input.
 */
export function parseRentPeriod(
  value: string | undefined,
): RentPeriod | null {
  if (!value) {
    return null;
  }

  const match =
    /^(\d{4})-(\d{2})$/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  const year =
    Number(match[1]);

  const month =
    Number(match[2]);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return {
    year,
    month,
  };
}

export function formatRentPeriod({
  year,
  month,
}: RentPeriod) {
  return `${year}-${String(
    month,
  ).padStart(2, "0")}`;
}

/**
 * Month arithmetic should NOT be done manually like:
 *
 *   month - 1
 *
 * because January would produce month 0.
 *
 * JavaScript's Date handles crossing year boundaries safely.
 */
export function shiftRentPeriod(
  period: RentPeriod,
  offset: number,
): RentPeriod {
  const date =
    new Date(
      Date.UTC(
        period.year,
        period.month - 1 + offset,
        1,
      ),
    );

  return {
    year:
      date.getUTCFullYear(),

    month:
      date.getUTCMonth() + 1,
  };
}

export function getRentPeriodLabel(
  period: RentPeriod,
) {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      month: "long",
      year: "numeric",

      timeZone:
        "Asia/Manila",
    },
  ).format(
    new Date(
      Date.UTC(
        period.year,
        period.month - 1,
        1,
      ),
    ),
  );
}