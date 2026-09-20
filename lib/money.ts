/**
 * Converts a peso amount into integer centavos.
 *
 * MONEY SAFETY:
 * JavaScript floating-point numbers are not reliable for exact
 * financial arithmetic:
 *
 *   0.1 + 0.2 !== 0.3
 *
 * Abang PH therefore performs application-level calculations using
 * integer centavos:
 *
 *   ₱3,000.00 -> 300000n
 *
 * This prevents rounding errors when calculating rent balances,
 * payment allocations, totals, and outstanding amounts.
 */

export function moneyToCents(
  value: string | number | { toString(): string },
) {
  const raw = String(value).trim();

  if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    throw new Error("Invalid money amount.");
  }

  const [whole, decimal = ""] = raw.split(".");

  const decimalPart =
    (decimal + "00").slice(0, 2);

  return (
    BigInt(whole) * 100n +
    BigInt(decimalPart)
  );
}

export function centsToMoney(
  cents: bigint,
) {
  const whole = cents / 100n;

  const decimal =
    (cents % 100n)
      .toString()
      .padStart(2, "0");

  return `${whole}.${decimal}`;
}

export function formatPHP(
  cents: bigint,
) {
  return new Intl.NumberFormat(
    "en-PH",
    {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  ).format(Number(cents) / 100);
}