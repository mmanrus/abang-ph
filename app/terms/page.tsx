import Link from "next/link";

import {
  ArrowLeft,
  FileText,
  Mail,
} from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white">
              A
            </div>

            <div>
              <p className="font-semibold">
                Abang PH
              </p>

              <p className="text-xs text-zinc-500">
                Terms of Service
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
            />

            Home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
            <FileText
              size={23}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Terms of Service
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Effective: September 24, 2026
          </p>

          <p className="mt-6 max-w-2xl leading-7 text-zinc-600">
            These Terms govern your use of Abang PH. By creating
            an account or using the service, you agree to use the
            application responsibly and in accordance with these
            Terms.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-zinc-700">
          <Section
            title="1. The service"
          >
            <p>
              Abang PH provides tools for managing rental
              properties, rentable spaces, tenants, leases, rent
              charges, payment records, expenses, and related
              rental-management information.
            </p>
          </Section>

          <Section
            title="2. Your account"
          >
            <p>
              You are responsible for maintaining accurate account
              information and protecting your login credentials.
            </p>

            <p>
              You may not intentionally allow unauthorized persons
              to access another landlord&apos;s information through
              your account.
            </p>
          </Section>

          <Section
            title="3. Rental records"
          >
            <p>
              Abang PH is a record-management tool. You remain
              responsible for your rental agreements, tenant
              relationships, payment collection, taxes, accounting,
              legal obligations, and business decisions.
            </p>

            <p>
              Information displayed by Abang PH should be reviewed
              by you before relying on it for important financial or
              legal decisions.
            </p>
          </Section>

          <Section
            title="4. Payment records"
          >
            <p>
              Recording a payment in Abang PH represents information
              entered by the landlord. Abang PH does not currently
              act as a bank, wallet, escrow provider, payment
              processor, or custodian of tenant rent funds.
            </p>
          </Section>

          <Section
            title="5. Acceptable use"
          >
            <p>
              You may not use Abang PH to intentionally break the
              law, gain unauthorized access to systems or accounts,
              interfere with the service, upload malicious content,
              abuse other users, or store information that you have
              no right to collect or use.
            </p>
          </Section>

          <Section
            title="6. Live demo"
          >
            <p>
              The Abang PH live demo is provided for evaluation
              purposes and contains fictional sample information.
            </p>

            <p>
              The demo is read-only. You must not attempt to bypass
              its restrictions, interfere with its operation, or use
              it to store real personal or confidential information.
            </p>
          </Section>

          <Section
            title="7. Availability"
          >
            <p>
              We aim to keep Abang PH available and reliable, but
              uninterrupted or error-free service cannot be
              guaranteed. Maintenance, infrastructure problems,
              software defects, or other events may temporarily
              affect availability.
            </p>
          </Section>

          <Section
            title="8. Backups and record keeping"
          >
            <p>
              Abang PH may maintain technical backups as part of
              operating the service. You should still keep any
              records that your business or applicable requirements
              require you to retain independently.
            </p>
          </Section>

          <Section
            title="9. Early-access features and pricing"
          >
            <p>
              During the early-access period, features, limits,
              onboarding arrangements, and pricing may be discussed
              directly with users and may change as Abang PH
              develops.
            </p>

            <p>
              Any paid arrangement will be communicated before you
              are charged.
            </p>
          </Section>

          <Section
            title="10. Suspension or termination"
          >
            <p>
              Access may be restricted or terminated when reasonably
              necessary to protect the service, other users,
              security, or to address serious violations of these
              Terms.
            </p>
          </Section>

          <Section
            title="11. Changes to the service or Terms"
          >
            <p>
              Abang PH may evolve over time. Features and these Terms
              may therefore be updated. The effective date will be
              updated when these Terms materially change.
            </p>
          </Section>

          <Section
            title="12. Contact"
          >
            <p>
              Questions about Abang PH, pricing, these Terms, or
              account support can be sent to:
            </p>

            <a
              href="mailto:mmanrusiana@gmail.com?subject=Abang%20PH%20Support"
              className="mt-3 inline-flex items-center gap-2 font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Mail
                size={16}
                aria-hidden="true"
              />

              mmanrusiana@gmail.com
            </a>
          </Section>
        </div>
      </article>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-4xl flex-wrap gap-x-6 gap-y-3 px-4 py-8 text-sm text-zinc-500 sm:px-6">
          <Link
            href="/"
            className="hover:text-zinc-950"
          >
            Home
          </Link>

          <Link
            href="/privacy"
            className="hover:text-zinc-950"
          >
            Privacy
          </Link>

          <Link
            href="/terms"
            className="hover:text-zinc-950"
          >
            Terms
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children:
    React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-zinc-950">
        {title}
      </h2>

      <div className="mt-3 space-y-3">
        {children}
      </div>
    </section>
  );
}