import Link from "next/link";

import {
  Home,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

import {
  requireAbangAdmin,
} from "@/lib/auth/require-abang-admin";

type Props = {
  children:
    React.ReactNode;
};

export default async function AdminLayout({
  children,
}: Props) {
  const {
    user,
  } =
    await requireAbangAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ======================================= */}
      {/* ADMIN HEADER                            */}
      {/* ======================================= */}

      <header className="border-b border-zinc-200 bg-white">
        <div className="
          mx-auto
          flex
          min-h-16
          max-w-7xl
          items-center
          justify-between
          gap-4
          px-4
          py-3
          sm:px-6
          lg:px-8
        ">
          <Link
            href="/admin"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-emerald-600
              text-white
            ">
              <ShieldCheck
                size={20}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="
                truncate
                text-sm
                font-semibold
                text-zinc-950
                sm:text-base
              ">
                Abang Admin
              </p>

              <p className="
                hidden
                truncate
                text-xs
                text-zinc-500
                sm:block
              ">
                Platform management
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-xl
              border
              border-zinc-200
              bg-white
              px-3
              text-sm
              font-medium
              text-zinc-700
              transition
              hover:bg-zinc-50
            "
          >
            <Home
              size={16}
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              Back to Abang
            </span>
          </Link>
        </div>
      </header>

      {/* ======================================= */}
      {/* ADMIN NAV                               */}
      {/* ======================================= */}

      <div className="border-b border-zinc-200 bg-white">
        <nav
          aria-label="Admin navigation"
          className="
            mx-auto
            flex
            max-w-7xl
            gap-2
            overflow-x-auto
            px-4
            py-2
            sm:px-6
            lg:px-8
          "
        >
          <Link
            href="/admin"
            className="
              inline-flex
              h-10
              shrink-0
              items-center
              rounded-xl
              px-3
              text-sm
              font-medium
              text-zinc-700
              transition
              hover:bg-zinc-100
            "
          >
            Overview
          </Link>

          <Link
            href="/admin/feedback"
            className="
              inline-flex
              h-10
              shrink-0
              items-center
              gap-2
              rounded-xl
              px-3
              text-sm
              font-medium
              text-zinc-700
              transition
              hover:bg-zinc-100
            "
          >
            <MessageSquareText
              size={16}
              aria-hidden="true"
            />

            Feedback
          </Link>
        </nav>
      </div>

      {/* ======================================= */}
      {/* CONTENT                                 */}
      {/* ======================================= */}

      <main>
        {children}
      </main>

      <footer className="
        mx-auto
        max-w-7xl
        px-4
        py-8
        text-xs
        text-zinc-400
        sm:px-6
        lg:px-8
      ">
        Signed in as {user.email}
      </footer>
    </div>
  );
}