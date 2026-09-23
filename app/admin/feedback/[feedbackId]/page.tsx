import Link from "next/link";

import {
  ArrowLeft,
  Bug,
  CircleHelp,
  Clock3,
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  SubmitButton,
} from "@/components/forms/submit-button";

import {
  requireAbangAdmin,
} from "@/lib/auth/require-abang-admin";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  replyToFeedbackAction,
  updateFeedbackStatusAction,
} from "./actions";
import { primaryButtonClass } from "@/lib/ui-classes";

type Props = {
  params: Promise<{
    feedbackId: string;
  }>;
};

export default async function FeedbackDetailPage({
  params,
}: Props) {
  /**
   * ADMIN AUTHORIZATION
   * -------------------
   *
   * Never rely only on hiding the admin navigation.
   *
   * This page independently checks that the authenticated
   * Better Auth user is an Abang platform administrator.
   */
  await requireAbangAdmin();

  const {
    feedbackId,
  } =
    await params;

  /**
   * ADMIN FEEDBACK LOOKUP
   * ---------------------
   *
   * Admins are allowed to inspect feedback across landlords,
   * so unlike a landlord-facing feedback page, this query does
   * not scope by landlordAccountId.
   *
   * The authorization boundary here is requireAbangAdmin().
   */
  const feedback =
    await prisma.feedback.findUnique({
      where: {
        id: feedbackId,
      },

      include: {
        replies: {
          orderBy: {
            createdAt:
              "asc",
          },
        },
      },
    });

  if (!feedback) {
    notFound();
  }

  return (
    <div
      className="
        mx-auto
        w-full
        max-w-5xl
        px-4
        py-6
        sm:px-6
        lg:px-8
        lg:py-8
      "
    >
      {/* ======================================= */}
      {/* BACK                                    */}
      {/* ======================================= */}

      <Link
        href="/admin/feedback"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-zinc-600
          transition
          hover:text-zinc-950
        "
      >
        <ArrowLeft
          size={17}
          aria-hidden="true"
        />

        Feedback inbox
      </Link>

      {/* ======================================= */}
      {/* HEADER                                  */}
      {/* ======================================= */}

      <div
        className="
          mt-5
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-start
          sm:justify-between
        "
      >
        <div className="min-w-0">
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <FeedbackTypeBadge
              type={feedback.type}
            />

            <FeedbackStatusBadge
              status={feedback.status}
            />
          </div>

          <h1
            className="
              mt-4
              break-words
              text-2xl
              font-semibold
              tracking-tight
              text-zinc-950
            "
          >
            {feedback.subject}
          </h1>

          <div
            className="
              mt-2
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-2
              text-sm
              text-zinc-500
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-1.5
              "
            >
              <Clock3
                size={15}
                aria-hidden="true"
              />

              {feedback.createdAt.toLocaleString(
                "en-PH",
              )}
            </span>

            {feedback.landlordAccountId && (
              <span>
                Landlord ID:{" "}
                {feedback.landlordAccountId}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ======================================= */}
      {/* PAGE SOURCE                             */}
      {/* ======================================= */}

      {feedback.page && (
        <div
          className="
            mt-6
            rounded-xl
            border
            border-zinc-200
            bg-zinc-50
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              font-medium
              uppercase
              tracking-wide
              text-zinc-400
            "
          >
            Submitted from
          </p>

          <p
            className="
              mt-1
              break-all
              text-sm
              text-zinc-700
            "
          >
            {feedback.page}
          </p>
        </div>
      )}

      {/* ======================================= */}
      {/* MAIN GRID                               */}
      {/* ======================================= */}

      <div
        className="
          mt-7
          grid
          gap-6
          xl:grid-cols-[1fr_320px]
        "
      >
        {/* ===================================== */}
        {/* LEFT                                  */}
        {/* ===================================== */}

        <div className="space-y-6">
          {/* ORIGINAL MESSAGE */}

          <section
            className="
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-50
                  text-emerald-700
                "
              >
                <MessageSquareText
                  size={18}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2
                  className="
                    font-semibold
                    text-zinc-950
                  "
                >
                  Original message
                </h2>

                <p
                  className="
                    mt-0.5
                    text-xs
                    text-zinc-500
                  "
                >
                  Submitted by the landlord
                </p>
              </div>
            </div>

            <p
              className="
                mt-5
                whitespace-pre-wrap
                break-words
                text-sm
                leading-7
                text-zinc-700
              "
            >
              {feedback.message}
            </p>
          </section>

          {/* =================================== */}
          {/* CONVERSATION                        */}
          {/* =================================== */}

          <section
            className="
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-5
              shadow-sm
              sm:p-6
            "
          >
            <div>
              <h2
                className="
                  font-semibold
                  text-zinc-950
                "
              >
                Conversation
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-zinc-500
                "
              >
                Replies between Abang Support and
                the landlord appear here.
              </p>
            </div>

            {feedback.replies.length === 0 ? (
              <div
                className="
                  mt-5
                  rounded-xl
                  border
                  border-dashed
                  border-zinc-300
                  bg-zinc-50
                  p-5
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-medium
                    text-zinc-700
                  "
                >
                  No replies yet
                </p>

                <p
                  className="
                    mt-1
                    text-xs
                    leading-5
                    text-zinc-500
                  "
                >
                  Send the first reply below.
                </p>
              </div>
            ) : (
              <div
                className="
                  mt-6
                  space-y-4
                "
              >
                {feedback.replies.map(
                  (reply) => (
                    <FeedbackReplyCard
                      key={reply.id}
                      authorType={
                        reply.authorType
                      }
                      message={
                        reply.message
                      }
                      createdAt={
                        reply.createdAt
                      }
                    />
                  ),
                )}
              </div>
            )}

            {/* ================================= */}
            {/* ADMIN REPLY                       */}
            {/* ================================= */}

            <div
              className="
                mt-6
                border-t
                border-zinc-100
                pt-6
              "
            >
              <h3
                className="
                  text-sm
                  font-semibold
                  text-zinc-900
                "
              >
                Reply to landlord
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-5
                  text-zinc-500
                "
              >
                The landlord will see this reply
                in their feedback conversation.
              </p>

              <form
                action={replyToFeedbackAction.bind(
                  null,
                  feedback.id,
                )}
                className="
                  mt-4
                  space-y-4
                "
              >
                <textarea
                  name="message"
                  required
                  minLength={2}
                  maxLength={3000}
                  rows={5}
                  placeholder="Write a helpful reply..."
                  className="
                    min-h-32
                    w-full
                    resize-y
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    leading-6
                    text-zinc-900
                    outline-none
                    transition
                    placeholder:text-zinc-400
                    focus:border-emerald-500
                    focus:ring-4
                    focus:ring-emerald-500/10
                  "
                />

                <SubmitButton
                  pendingText="Sending..."
                  className={primaryButtonClass}
                >
                  Send reply
                </SubmitButton>
              </form>
            </div>
          </section>
        </div>

        {/* ===================================== */}
        {/* RIGHT SIDEBAR                         */}
        {/* ===================================== */}

        <aside className="space-y-6">
          {/* STATUS */}

          <section
            className="
              rounded-2xl
              border
              border-zinc-200
              bg-white
              p-5
              shadow-sm
              xl:sticky
              xl:top-6
            "
          >
            <h2
              className="
                font-semibold
                text-zinc-950
              "
            >
              Ticket status
            </h2>

            <p
              className="
                mt-1
                text-sm
                leading-6
                text-zinc-500
              "
            >
              Track the progress of this feedback
              report.
            </p>

            <form
              action={updateFeedbackStatusAction.bind(
                null,
                feedback.id,
              )}
              className="
                mt-5
                space-y-4
              "
            >
              <div>
                <label
                  htmlFor="status"
                  className="
                    mb-2
                    block
                    text-sm
                    font-medium
                    text-zinc-800
                  "
                >
                  Status
                </label>

                <select
                  id="status"
                  name="status"
                  defaultValue={
                    feedback.status
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-zinc-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-zinc-800
                    outline-none
                    transition
                    focus:border-emerald-500
                    focus:ring-4
                    focus:ring-emerald-500/10
                  "
                >
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

              <SubmitButton
                pendingText="Updating..."
                className="
                  inline-flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-zinc-800
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                Update status
              </SubmitButton>
            </form>

            <div
              className="
                mt-6
                border-t
                border-zinc-100
                pt-5
              "
            >
              <p
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-wide
                  text-zinc-400
                "
              >
                Ticket
              </p>

              <p
                className="
                  mt-2
                  break-all
                  text-xs
                  text-zinc-500
                "
              >
                {feedback.id}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

/* ======================================================== */
/* FEEDBACK TYPE BADGE                                      */
/* ======================================================== */

function FeedbackTypeBadge({
  type,
}: {
  type:
    | "BUG"
    | "FEATURE"
    | "SUPPORT";
}) {
  const config = {
    BUG: {
      label:
        "Bug",

      icon:
        Bug,
    },

    FEATURE: {
      label:
        "Feature",

      icon:
        Lightbulb,
    },

    SUPPORT: {
      label:
        "Support",

      icon:
        CircleHelp,
    },
  } as const;

  const {
    label,
    icon: Icon,
  } =
    config[type];

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-full
        bg-emerald-50
        px-2.5
        py-1
        text-xs
        font-medium
        text-emerald-700
      "
    >
      <Icon
        size={13}
        aria-hidden="true"
      />

      {label}
    </span>
  );
}

/* ======================================================== */
/* FEEDBACK STATUS BADGE                                    */
/* ======================================================== */

function FeedbackStatusBadge({
  status,
}: {
  status:
    | "OPEN"
    | "REVIEWING"
    | "RESOLVED"
    | "CLOSED";
}) {
  const styles = {
    OPEN:
      "bg-zinc-100 text-zinc-700",

    REVIEWING:
      "bg-amber-50 text-amber-700",

    RESOLVED:
      "bg-emerald-50 text-emerald-700",

    CLOSED:
      "bg-zinc-200 text-zinc-600",
  } as const;

  const labels = {
    OPEN:
      "Open",

    REVIEWING:
      "Reviewing",

    RESOLVED:
      "Resolved",

    CLOSED:
      "Closed",
  } as const;

  return (
    <span
      className={[
        "rounded-full px-2.5 py-1 text-xs font-medium",

        styles[
          status
        ],
      ].join(" ")}
    >
      {labels[
        status
      ]}
    </span>
  );
}

/* ======================================================== */
/* FEEDBACK REPLY                                           */
/* ======================================================== */

function FeedbackReplyCard({
  authorType,
  message,
  createdAt,
}: {
  authorType:
    | "ADMIN"
    | "LANDLORD";

  message:
    string;

  createdAt:
    Date;
}) {
  const isAdmin =
    authorType ===
    "ADMIN";

  return (
    <div
      className={[
        "rounded-2xl border p-4",

        isAdmin
          ? "border-emerald-100 bg-emerald-50/50"
          : "border-zinc-200 bg-zinc-50",
      ].join(" ")}
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <div
            className={[
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",

              isAdmin
                ? "bg-emerald-600 text-white"
                : "bg-white text-zinc-600",
            ].join(" ")}
          >
            {isAdmin ? (
              <ShieldCheck
                size={17}
                aria-hidden="true"
              />
            ) : (
              <UserRound
                size={17}
                aria-hidden="true"
              />
            )}
          </div>

          <div className="min-w-0">
            <p
              className="
                text-sm
                font-medium
                text-zinc-900
              "
            >
              {isAdmin
                ? "Abang Support"
                : "Landlord"}
            </p>

            <time
              dateTime={
                createdAt.toISOString()
              }
              className="
                text-xs
                text-zinc-400
              "
            >
              {createdAt.toLocaleString(
                "en-PH",
              )}
            </time>
          </div>
        </div>
      </div>

      <p
        className="
          mt-4
          whitespace-pre-wrap
          break-words
          text-sm
          leading-6
          text-zinc-700
        "
      >
        {message}
      </p>
    </div>
  );
}