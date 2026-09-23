import Link from "next/link";

import {
  Bug,
  CircleHelp,
  Eye,
  Lightbulb,
  MessageSquareText,
} from "lucide-react";

import {
  SearchButton,
} from "@/components/forms/search-button";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/ui/data-table";

import {
  Pagination,
} from "@/components/ui/pagination";

import {
  StatusBadge,
} from "@/components/ui/status-badge";

import {
  requireAbangAdmin,
} from "@/lib/auth/require-abang-admin";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  PAGE_SIZE,
  getSkip,
  getTotalPages,
  parsePage,
} from "@/lib/pagination";

type Props = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    type?: string;
    status?: string;
  }>;
};

const FEEDBACK_TYPES = [
  "BUG",
  "FEATURE",
  "SUPPORT",
] as const;

const FEEDBACK_STATUSES = [
  "OPEN",
  "REVIEWING",
  "RESOLVED",
  "CLOSED",
] as const;

type FeedbackType =
  (typeof FEEDBACK_TYPES)[number];

type FeedbackStatus =
  (typeof FEEDBACK_STATUSES)[number];

export default async function AdminFeedbackPage({
  searchParams,
}: Props) {
  /**
   * ADMIN AUTHORIZATION
   * -------------------
   *
   * The admin layout should already protect this route,
   * but the page protects its own database read as well.
   */
  await requireAbangAdmin();

  const query =
    await searchParams;

  const search =
    query.q?.trim() ?? "";

  const requestedPage =
    parsePage(
      query.page,
    );

  const type =
    isFeedbackType(
      query.type,
    )
      ? query.type
      : undefined;

  const status =
    isFeedbackStatus(
      query.status,
    )
      ? query.status
      : undefined;

  /**
   * SEARCH / FILTER CONDITIONS
   * --------------------------
   *
   * These values control filtering only.
   * They have nothing to do with authorization.
   */
  const where = {
    ...(type
      ? {
          type,
        }
      : {}),

    ...(status
      ? {
          status,
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              subject: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },

            {
              message: {
                contains:
                  search,

                mode:
                  "insensitive" as const,
              },
            },
          ],
        }
      : {}),
  };

  /**
   * We count first so we know the valid page range.
   *
   * Example:
   *
   *   43 feedback records
   *   PAGE_SIZE = 20
   *
   *   totalPages = 3
   */
  const totalItems =
    await prisma.feedback.count({
      where,
    });

  const totalPages =
    getTotalPages(
      totalItems,
      PAGE_SIZE,
    );

  /**
   * Protect against somebody manually entering:
   *
   *   ?page=999999
   *
   * Instead of querying a useless offset,
   * we clamp to the last valid page.
   */
  const page =
    Math.min(
      requestedPage,
      totalPages,
    );

  const feedback =
    await prisma.feedback.findMany({
      where,

      orderBy: {
        createdAt:
          "desc",
      },

      skip:
        getSkip(
          page,
          PAGE_SIZE,
        ),

      take:
        PAGE_SIZE,

      include: {
        _count: {
          select: {
            replies:
              true,
          },
        },
      },
    });

  /**
   * TypeScript can infer our row shape directly
   * from the Prisma query above.
   */
  type FeedbackRow =
    (typeof feedback)[number];

  const columns:
    DataTableColumn<FeedbackRow>[] =
    [
      {
        key:
          "type",

        header:
          "Type",

        cell:
          (item) => (
            <FeedbackTypeBadge
              type={
                item.type
              }
            />
          ),
      },

      {
        key:
          "subject",

        header:
          "Subject",

        cell:
          (item) => (
            <div className="min-w-[220px] max-w-md">
              <p className="truncate font-medium text-zinc-900">
                {
                  item.subject
                }
              </p>

              {item.page && (
                <p className="mt-1 truncate text-xs text-zinc-400">
                  {
                    item.page
                  }
                </p>
              )}
            </div>
          ),
      },

      {
        key:
          "status",

        header:
          "Status",

        cell:
          (item) => (
            <FeedbackStatusBadge
              status={
                item.status
              }
            />
          ),
      },

      {
        key:
          "replies",

        header:
          "Replies",

        cell:
          (item) => (
            <span className="tabular-nums">
              {
                item
                  ._count
                  .replies
              }
            </span>
          ),

        className:
          "whitespace-nowrap",
      },

      {
        key:
          "createdAt",

        header:
          "Created",

        cell:
          (item) => (
            <time
              dateTime={
                item.createdAt.toISOString()
              }
              className="whitespace-nowrap text-zinc-500"
            >
              {item.createdAt.toLocaleDateString(
                "en-PH",
              )}
            </time>
          ),

        className:
          "whitespace-nowrap",
      },

      {
        key:
          "action",

        header:
          "Action",

        headerClassName:
          "text-right",

        className:
          "text-right",

        cell:
          (item) => (
            <Link
              href={`/admin/feedback/${item.id}`}
              aria-label={`View feedback: ${item.subject}`}
              className="
                inline-flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-zinc-200
                bg-white
                text-zinc-600
                transition
                hover:bg-zinc-50
                hover:text-zinc-950
              "
            >
              <Eye
                size={16}
                aria-hidden="true"
              />
            </Link>
          ),
      },
    ];

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-7xl
        px-4
        py-6
        sm:px-6
        lg:px-8
        lg:py-8
      "
    >
      {/* ======================================= */}
      {/* HEADER                                  */}
      {/* ======================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
              text-zinc-950
            "
          >
            Feedback inbox
          </h1>

          <p
            className="
              mt-1
              max-w-2xl
              text-sm
              leading-6
              text-zinc-500
            "
          >
            Review bug reports,
            feature requests, and
            support messages submitted
            through Abang PH.
          </p>
        </div>

        <div
          className="
            inline-flex
            w-fit
            items-center
            gap-2
            rounded-xl
            bg-zinc-100
            px-3
            py-2
            text-sm
            text-zinc-600
          "
        >
          <MessageSquareText
            size={16}
            aria-hidden="true"
          />

          <span>
            {totalItems.toLocaleString(
              "en-PH",
            )}{" "}
            {totalItems === 1
              ? "message"
              : "messages"}
          </span>
        </div>
      </div>

      {/* ======================================= */}
      {/* SEARCH + FILTERS                        */}
      {/* ======================================= */}

      <form
        method="get"
        className="
          mt-7
          grid
          gap-3
          rounded-2xl
          border
          border-zinc-200
          bg-white
          p-4
          shadow-sm
          sm:grid-cols-2
          lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]
        "
      >
        <div>
          <label
            htmlFor="feedback-search"
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-zinc-500
            "
          >
            Search
          </label>

          <input
            id="feedback-search"
            type="search"
            name="q"
            defaultValue={
              search
            }
            placeholder="Search subject or message..."
            className="
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-4
              py-2.5
              text-sm
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-4
              focus:ring-emerald-500/10
            "
          />
        </div>

        <div>
          <label
            htmlFor="feedback-type"
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-zinc-500
            "
          >
            Type
          </label>

          <select
            id="feedback-type"
            name="type"
            defaultValue={
              type ?? ""
            }
            className="
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-3
              py-2.5
              text-sm
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-4
              focus:ring-emerald-500/10
            "
          >
            <option value="">
              All types
            </option>

            <option value="BUG">
              Bug
            </option>

            <option value="FEATURE">
              Feature
            </option>

            <option value="SUPPORT">
              Support
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="feedback-status"
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-zinc-500
            "
          >
            Status
          </label>

          <select
            id="feedback-status"
            name="status"
            defaultValue={
              status ?? ""
            }
            className="
              w-full
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-3
              py-2.5
              text-sm
              outline-none
              transition
              focus:border-emerald-500
              focus:ring-4
              focus:ring-emerald-500/10
            "
          >
            <option value="">
              All statuses
            </option>

            <option value="OPEN">
              Open
            </option>

            <option value="REVIEWING">
              Reviewing
            </option>

            <option value="RESOLVED">
              Resolved
            </option>

            <option value="CLOSED">
              Closed
            </option>
          </select>
        </div>

        <div className="flex items-end">
          <SearchButton
            pendingText="Searching..."
            className="
              inline-flex
              min-h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-zinc-950
              px-4
              text-sm
              font-medium
              text-white
              transition
              hover:bg-zinc-800
              disabled:cursor-not-allowed
              disabled:opacity-60
              lg:w-auto
            "
          >
            Search
          </SearchButton>
        </div>
      </form>

      {/* ======================================= */}
      {/* ACTIVE FILTER RESET                     */}
      {/* ======================================= */}

      {(search ||
        type ||
        status) && (
        <div className="mt-4">
          <Link
            href="/admin/feedback"
            className="
              text-sm
              font-medium
              text-zinc-500
              transition
              hover:text-zinc-950
            "
          >
            Clear filters
          </Link>
        </div>
      )}

      {/* ======================================= */}
      {/* EMPTY STATE                             */}
      {/* ======================================= */}

      {feedback.length ===
      0 ? (
        <div
          className="
            mt-7
            rounded-2xl
            border
            border-dashed
            border-zinc-300
            bg-white
            p-8
            text-center
          "
        >
          <p className="font-medium text-zinc-800">
            No feedback found
          </p>

          <p
            className="
              mx-auto
              mt-1
              max-w-md
              text-sm
              leading-6
              text-zinc-500
            "
          >
            {search ||
            type ||
            status
              ? "Try changing or clearing your search filters."
              : "Bug reports, feature requests, and support messages will appear here."}
          </p>
        </div>
      ) : (
        <>
          {/* =================================== */}
          {/* REUSABLE TABLE                      */}
          {/* =================================== */}

          <div className="mt-7">
            <DataTable
              rows={
                feedback
              }
              columns={
                columns
              }
              rowKey={(
                item,
              ) =>
                item.id
              }
            />
          </div>

          {/* =================================== */}
          {/* REUSABLE PAGINATION                 */}
          {/* =================================== */}

          <Pagination
            basePath="/admin/feedback"
            page={
              page
            }
            totalPages={
              totalPages
            }
            totalItems={
              totalItems
            }
            pageSize={
              PAGE_SIZE
            }
            query={{
              q:
                search ||
                undefined,

              type,

              status,
            }}
          />
        </>
      )}
    </div>
  );
}

/* ======================================================== */
/* TYPE BADGE                                               */
/* ======================================================== */

function FeedbackTypeBadge({
  type,
}: {
  type:
    FeedbackType;
}) {
  const config = {
    BUG: {
      label:
        "Bug",

      icon:
        Bug,

      tone:
        "red" as const,
    },

    FEATURE: {
      label:
        "Feature",

      icon:
        Lightbulb,

      tone:
        "blue" as const,
    },

    SUPPORT: {
      label:
        "Support",

      icon:
        CircleHelp,

      tone:
        "green" as const,
    },
  };

  const item =
    config[type];

  const Icon =
    item.icon;

  return (
    <StatusBadge
      tone={
        item.tone
      }
    >
      <span
        className="
          inline-flex
          items-center
          gap-1.5
        "
      >
        <Icon
          size={13}
          aria-hidden="true"
        />

        {
          item.label
        }
      </span>
    </StatusBadge>
  );
}

/* ======================================================== */
/* STATUS BADGE                                             */
/* ======================================================== */

function FeedbackStatusBadge({
  status,
}: {
  status:
    FeedbackStatus;
}) {
  const config = {
    OPEN: {
      label:
        "Open",

      tone:
        "gray" as const,
    },

    REVIEWING: {
      label:
        "Reviewing",

      tone:
        "amber" as const,
    },

    RESOLVED: {
      label:
        "Resolved",

      tone:
        "green" as const,
    },

    CLOSED: {
      label:
        "Closed",

      tone:
        "gray" as const,
    },
  };

  const item =
    config[status];

  return (
    <StatusBadge
      tone={
        item.tone
      }
    >
      {
        item.label
      }
    </StatusBadge>
  );
}

/* ======================================================== */
/* FILTER VALIDATION                                        */
/* ======================================================== */

function isFeedbackType(
  value:
    string |
    undefined,
): value is FeedbackType {
  if (!value) {
    return false;
  }

  return FEEDBACK_TYPES.includes(
    value as
      FeedbackType,
  );
}

function isFeedbackStatus(
  value:
    string |
    undefined,
): value is FeedbackStatus {
  if (!value) {
    return false;
  }

  return FEEDBACK_STATUSES.includes(
    value as
      FeedbackStatus,
  );
}