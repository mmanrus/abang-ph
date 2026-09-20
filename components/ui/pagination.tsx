import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Props = {
  basePath: string;

  page: number;

  totalPages:
    number;

  totalItems:
    number;

  pageSize:
    number;

  /**
   * Existing filters that should remain in the URL.
   *
   * Example:
   *
   * {
   *   q: "juan",
   *   status: "inactive"
   * }
   */
  query?: Record<
    string,
    string | undefined
  >;
};

export function Pagination({
  basePath,
  page,
  totalPages,
  totalItems,
  pageSize,
  query = {},
}: Props) {
  if (
    totalItems === 0
  ) {
    return null;
  }

  const firstItem =
    (page - 1) *
      pageSize +
    1;

  const lastItem =
    Math.min(
      page * pageSize,
      totalItems,
    );

  function makeHref(
    targetPage: number,
  ) {
    const params =
      new URLSearchParams();

    for (
      const [
        key,
        value,
      ] of Object.entries(
        query,
      )
    ) {
      if (value) {
        params.set(
          key,
          value,
        );
      }
    }

    /**
     * Page 1 doesn't need:
     *
     * ?page=1
     *
     * Keeping the default URL clean is nicer.
     */
    if (
      targetPage >
      1
    ) {
      params.set(
        "page",
        String(
          targetPage,
        ),
      );
    }

    const search =
      params.toString();

    return search
      ? `${basePath}?${search}`
      : basePath;
  }

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-zinc-500">
        Showing{" "}
        <span className="font-medium text-zinc-700">
          {firstItem}–
          {lastItem}
        </span>{" "}
        of{" "}
        <span className="font-medium text-zinc-700">
          {totalItems}
        </span>
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={makeHref(
              page - 1,
            )}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            <ChevronLeft
              size={16}
            />

            Previous
          </Link>
        ) : (
          <span className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-400">
            <ChevronLeft
              size={16}
            />

            Previous
          </span>
        )}

        <span className="px-2 text-sm text-zinc-500">
          Page{" "}
          <strong className="font-medium text-zinc-800">
            {page}
          </strong>{" "}
          of{" "}
          <strong className="font-medium text-zinc-800">
            {
              totalPages
            }
          </strong>
        </span>

        {page <
        totalPages ? (
          <Link
            href={makeHref(
              page + 1,
            )}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Next

            <ChevronRight
              size={16}
            />
          </Link>
        ) : (
          <span className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-400">
            Next

            <ChevronRight
              size={16}
            />
          </span>
        )}
      </div>
    </div>
  );
}