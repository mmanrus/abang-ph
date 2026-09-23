import Link from "next/link";

import {
  Bug,
  CircleHelp,
  Lightbulb,
  MessageSquareText,
} from "lucide-react";

import {
  prisma,
} from "@/lib/db/prisma";

export default async function AdminPage() {
  const [
    totalFeedback,
    openFeedback,
    bugCount,
    featureCount,
  ] =
    await Promise.all([
      prisma.feedback.count(),

      prisma.feedback.count({
        where: {
          status: "OPEN",
        },
      }),

      prisma.feedback.count({
        where: {
          type: "BUG",
        },
      }),

      prisma.feedback.count({
        where: {
          type: "FEATURE",
        },
      }),
    ]);

  return (
    <div className="
      mx-auto
      max-w-7xl
      px-4
      py-6
      sm:px-6
      lg:px-8
      lg:py-8
    ">
      <div>
        <p className="
          text-sm
          font-medium
          text-emerald-700
        ">
          Platform administration
        </p>

        <h1 className="
          mt-1
          text-2xl
          font-semibold
          tracking-tight
          text-zinc-950
        ">
          Admin overview
        </h1>

        <p className="
          mt-2
          max-w-2xl
          text-sm
          leading-6
          text-zinc-500
        ">
          Review feedback and monitor internal
          Abang PH platform activity.
        </p>
      </div>

      {/* ======================================= */}
      {/* METRICS                                 */}
      {/* ======================================= */}

      <div className="
        mt-7
        grid
        gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      ">
        <AdminMetric
          label="Total feedback"
          value={totalFeedback}
          icon={MessageSquareText}
        />

        <AdminMetric
          label="Open"
          value={openFeedback}
          icon={CircleHelp}
        />

        <AdminMetric
          label="Bug reports"
          value={bugCount}
          icon={Bug}
        />

        <AdminMetric
          label="Feature requests"
          value={featureCount}
          icon={Lightbulb}
        />
      </div>

      {/* ======================================= */}
      {/* ADMIN TOOLS                             */}
      {/* ======================================= */}

      <section className="
        mt-8
        rounded-2xl
        border
        border-zinc-200
        bg-white
        p-5
        shadow-sm
        sm:p-6
      ">
        <h2 className="
          font-semibold
          text-zinc-950
        ">
          Admin tools
        </h2>

        <p className="
          mt-1
          text-sm
          text-zinc-500
        ">
          Internal tools for managing the Abang PH platform.
        </p>

        <div className="mt-5">
          <Link
            href="/admin/feedback"
            className="
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-zinc-200
              p-4
              transition
              hover:border-emerald-200
              hover:bg-emerald-50/40
            "
          >
            <div className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-50
              text-emerald-700
            ">
              <MessageSquareText
                size={20}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="
                font-medium
                text-zinc-900
              ">
                Feedback inbox
              </p>

              <p className="
                mt-1
                text-sm
                text-zinc-500
              ">
                Review bug reports, feature requests,
                and support messages.
              </p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

function AdminMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon:
    React.ElementType;
}) {
  return (
    <article className="
      rounded-2xl
      border
      border-zinc-200
      bg-white
      p-5
      shadow-sm
    ">
      <div className="
        flex
        items-center
        justify-between
        gap-4
      ">
        <p className="
          text-sm
          font-medium
          text-zinc-500
        ">
          {label}
        </p>

        <Icon
          size={18}
          className="text-zinc-400"
          aria-hidden="true"
        />
      </div>

      <p className="
        mt-3
        text-2xl
        font-semibold
        tracking-tight
        text-zinc-950
      ">
        {value.toLocaleString(
          "en-PH",
        )}
      </p>
    </article>
  );
}