export function getManilaToday() {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Manila",

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(
      new Date(),
    );

  const year = Number(
    parts.find(
      (part) =>
        part.type === "year",
    )?.value,
  );

  const month = Number(
    parts.find(
      (part) =>
        part.type === "month",
    )?.value,
  );

  const day = Number(
    parts.find(
      (part) =>
        part.type === "day",
    )?.value,
  );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
    ),
  );
}

export function getCurrentManilaPeriod() {
  const today =
    getManilaToday();

  return {
    year:
      today.getUTCFullYear(),

    month:
      today.getUTCMonth() + 1,
  };
}

export function getPeriodStart(
  year: number,
  month: number,
) {
  return new Date(
    Date.UTC(
      year,
      month - 1,
      1,
    ),
  );
}

export function getPeriodEnd(
  year: number,
  month: number,
) {
  return new Date(
    Date.UTC(
      year,
      month,
      0,
    ),
  );
}

export function getRentDueDate(
  year: number,
  month: number,
  dueDay: number,
) {
  /*
   * Lease can specify day 31.
   *
   * February obviously doesn't have 31 days,
   * so clamp it to the month's final day.
   */

  const lastDay =
    getPeriodEnd(
      year,
      month,
    ).getUTCDate();

  const actualDay =
    Math.min(
      dueDay,
      lastDay,
    );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      actualDay,
    ),
  );
}