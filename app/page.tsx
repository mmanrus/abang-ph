import Link from "next/link";


import {
  PublicNavigation,
} from "@/components/landing/public-navigation";

import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CircleDollarSign,
  Mail,
  ReceiptText,
  Smartphone,
  UsersRound,
  WalletCards,
} from "lucide-react";
import {
  getOptionalSession,
} from "@/lib/auth/get-session";
import { DemoLoginButton } from "@/components/demo/demo-login-button";
/**
 * PUBLIC LANDING PAGE
 * -------------------
 *
 * This route is intentionally OUTSIDE:
 *
 *   app/(app)
 *
 * because /(app) is protected by requireLandlord().
 *
 * `/` must remain publicly accessible so somebody who
 * has never signed up can learn what Abang PH does.
 *
 * Our structure is therefore:
 *
 * /
 *       public marketing site
 *
 * /login
 * /register
 *       authentication
 *
 * /dashboard
 * /properties
 * ...
 *       protected application
 */
export default async function HomePage() {
  const session =
    await getOptionalSession();

  const signedIn =
    Boolean(session);
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      {/* ================================================== */}
      {/* NAVIGATION                                         */}
      {/* ================================================== */}

      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 sm:gap-3"
          >
            <BrandMark />

            <div>
              <p className="whitespace-nowrap text-sm font-semibold tracking-tight text-zinc-950 sm:text-base">
                Abang PH
              </p>

              <p className="hidden text-[11px] text-zinc-500 sm:block">
                Rental management made simple
              </p>
            </div>
          </Link>

          <PublicNavigation
            signedIn={signedIn}
          />
        </div>
      </header>

      {/* ================================================== */}
      {/* HERO                                               */}
      {/* ================================================== */}

      <section className="overflow-hidden border-b border-zinc-100">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              Built for Filipino rental businesses
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              Manage your rentals without the spreadsheets.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
              Abang PH helps landlords manage
              properties, tenants, rent collections,
              payments, and expenses from one simple
              workspace.
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              Questions or feedback?{" "}
              <a
                href="mailto:mmanrusiana@gmail.com"
                className="font-medium text-zinc-600 transition hover:text-emerald-700"
              >
                mmanrusiana@gmail.com
              </a>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {signedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Back to dashboard

                  <ArrowRight
                    size={17}
                  />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    Start managing your rentals

                    <ArrowRight
                      size={17}
                    />
                  </Link>
                  <DemoLoginButton />
                  <Link
                    href="/login"
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                  >
                    I already have an account
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-zinc-500">
              <SmallCheck>
                Boarding houses
              </SmallCheck>

              <SmallCheck>
                Apartments
              </SmallCheck>

              <SmallCheck>
                Dormitories
              </SmallCheck>

              <SmallCheck>
                Bedspaces
              </SmallCheck>
            </div>
          </div>

          {/* HERO PRODUCT PREVIEW */}
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-10 -z-10 rounded-full bg-emerald-100/50 blur-3xl"
            />

            <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-3 shadow-2xl shadow-zinc-200/60 sm:p-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                {/* Mock application header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
                  <div>
                    <p className="text-xs text-zinc-500">
                      September 2026
                    </p>

                    <p className="mt-1 font-semibold text-zinc-950">
                      Rental overview
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-sm font-semibold text-white">
                    A
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 p-4 sm:p-5">
                  <PreviewMetric
                    label="Expected Rent"
                    value="₱48,000"
                  />

                  <PreviewMetric
                    label="Collected"
                    value="₱39,500"
                  />

                  <PreviewMetric
                    label="Outstanding"
                    value="₱8,500"
                  />

                  <PreviewMetric
                    label="Occupancy"
                    value="92%"
                  />
                </div>

                {/* Fake tenant rows */}
                <div className="border-t border-zinc-100 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Needs attention
                  </p>

                  <div className="mt-3 space-y-3">
                    <PreviewTenant
                      name="Juan Dela Cruz"
                      location="Room 101 · Bed A"
                      amount="₱3,500"
                    />

                    <PreviewTenant
                      name="Maria Santos"
                      location="Room 202 · Entire Unit"
                      amount="₱5,000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* VALUE PROPOSITION                                  */}
      {/* ================================================== */}

      <section className="bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-700">
              Everything in one place
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Know what&apos;s occupied, what&apos;s paid,
              and where your money goes.
            </h2>

            <p className="mt-4 text-base leading-7 text-zinc-600">
              Abang keeps your day-to-day rental records
              organized without forcing you into complicated
              accounting software.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <FeatureCard
              icon={Building2}
              title="Properties & spaces"
              description="Organize properties, rooms, units, beds, and rentable spaces with clear occupancy information."
            />

            <FeatureCard
              icon={UsersRound}
              title="Tenant records"
              description="Keep tenant contact details, lease history, emergency contacts, and current assignments together."
            />

            <FeatureCard
              icon={CircleDollarSign}
              title="Rent tracking"
              description="Generate monthly rent charges and immediately see paid, partial, outstanding, and overdue balances."
            />

            <FeatureCard
              icon={ReceiptText}
              title="Payment history"
              description="Record cash, GCash, Maya, bank transfers, partial payments, and multi-month payments."
            />

            <FeatureCard
              icon={WalletCards}
              title="Expense tracking"
              description="Track repairs, utilities, supplies, salaries, maintenance, and other property expenses."
            />

            <FeatureCard
              icon={BarChart3}
              title="Financial overview"
              description="Understand expected rent, collections, expenses, outstanding balances, and net cash flow."
            />
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* DESIGNED FOR REAL RENTAL SETUPS                    */}
      {/* ================================================== */}

      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Flexible rental structure
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              A room doesn&apos;t have to mean one tenant.
            </h2>

            <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600">
              Boarding houses and bedspaces don&apos;t always
              work like traditional apartments. Abang is built
              to handle properties where one room can contain
              several separately rented spaces.
            </p>

            <div className="mt-8 space-y-3">
              <StructureRow>
                Property
              </StructureRow>

              <StructureRow indent={1}>
                Room / Unit
              </StructureRow>

              <StructureRow indent={2}>
                Rentable Space
              </StructureRow>

              <StructureRow indent={3}>
                Tenant & Lease
              </StructureRow>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Example
            </p>

            <h3 className="mt-2 text-xl font-semibold text-zinc-950">
              Rusiana Boarding House
            </h3>

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
              <p className="font-medium text-zinc-900">
                Room 101
              </p>

              <div className="mt-4 space-y-3">
                <SpaceExample
                  name="Bed A"
                  status="Juan · Occupied"
                />

                <SpaceExample
                  name="Bed B"
                  status="Maria · Occupied"
                />

                <SpaceExample
                  name="Bed C"
                  status="Available"
                  available
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* MOBILE / RESPONSIVE                                */}
      {/* ================================================== */}

      <section className="border-y border-zinc-100 bg-zinc-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <Smartphone
              size={29}
              aria-hidden="true"
            />
          </div>

          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Made to work wherever landlords do.
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-zinc-300">
              Use Abang from a phone while checking rooms,
              from a tablet at the property, or from your
              desktop when reviewing monthly collections.
            </p>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FINAL CTA                                          */}
      {/* ================================================== */}

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="overflow-hidden rounded-3xl bg-emerald-600 px-6 py-12 text-center text-white sm:px-10 sm:py-16">
            <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Spend less time tracking rent and more time running your property.
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-emerald-50">
              Start organizing your properties, tenants,
              rent, payments, and expenses with Abang PH.
            </p>

            <Link
              href="/register"
              className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
            >
              Get started

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================== */}
      {/* FOOTER                                             */}
      {/* ================================================== */}

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandMark small />

            <div>
              <p className="text-sm font-semibold text-zinc-950">
                Abang PH
              </p>

              <p className="text-xs text-zinc-500">
                Rental management for Filipino landlords.
              </p>
            </div>
          </div>
          {signedIn ? (<>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium leading-none text-zinc-600 hover:text-zinc-950"
            >
              <span>Back to dashboard</span>

              <ArrowRight
                size={17}
                className="shrink-0"
                aria-hidden="true"
              />
            </Link>

            <a
              href="mailto:mmanrusiana@gmail.com"
              className="inline-flex items-center justify-center gap-2 text-sm font-medium leading-none text-zinc-600 transition hover:text-zinc-950"
            >
              <span>Contact Developer</span>

              <Mail
                size={17}
                className="shrink-0"
                aria-hidden="true"
              />
            </a>
          </>
          ) : (
            <div className="flex gap-5 text-sm text-zinc-500">
              <Link
                href="/login"
                className="hover:text-zinc-950"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="hover:text-zinc-950"
              >
                Register
              </Link>

              <a
                href="mailto:mmanrusiana@gmail.com"
                className="transition hover:text-zinc-950"
              >
                Contact Developer
              </a>
            </div>
          )}
        </div>
      </footer>
    </main>
  );
}

function BrandMark({
  small = false,
}: {
  small?: boolean;
}) {
  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white",

        small
          ? "h-9 w-9 text-sm"
          : "h-10 w-10",
      ].join(" ")}
      aria-hidden="true"
    >
      A
    </div>
  );
}

function SmallCheck({
  children,
}: {
  children:
  React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        <Check
          size={12}
          strokeWidth={3}
          aria-hidden="true"
        />
      </span>

      {children}
    </span>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon:
  React.ElementType;

  title:
  string;

  description:
  string;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
        <Icon
          size={21}
          aria-hidden="true"
        />
      </div>

      <h3 className="mt-5 font-semibold text-zinc-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </article>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <p className="text-[11px] text-zinc-500">
        {label}
      </p>

      <p className="mt-1 font-semibold tabular-nums text-zinc-950 sm:text-lg">
        {value}
      </p>
    </div>
  );
}

function PreviewTenant({
  name,
  location,
  amount,
}: {
  name: string;
  location: string;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">
          {name}
        </p>

        <p className="mt-0.5 truncate text-xs text-zinc-500">
          {location}
        </p>
      </div>

      <p className="shrink-0 text-sm font-semibold tabular-nums text-red-700">
        {amount}
      </p>
    </div>
  );
}

function StructureRow({
  children,
  indent = 0,
}: {
  children:
  React.ReactNode;

  indent?: number;
}) {
  return (
    <div
      className="flex items-center gap-3"
      style={{
        paddingLeft:
          `${indent * 24}px`,
      }}
    >
      <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

      <p className="font-medium text-zinc-800">
        {children}
      </p>
    </div>
  );
}

function SpaceExample({
  name,
  status,
  available = false,
}: {
  name: string;
  status: string;
  available?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 px-4 py-3">
      <p className="text-sm font-medium text-zinc-800">
        {name}
      </p>

      <span
        className={[
          "rounded-full px-2.5 py-1 text-xs font-medium",

          available
            ? "bg-blue-50 text-blue-700"
            : "bg-emerald-50 text-emerald-700",
        ].join(" ")}
      >
        {status}
      </span>
    </div>
  );
}