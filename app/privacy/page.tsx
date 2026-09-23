import Link from "next/link";

import {
  ArrowLeft,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function PrivacyPage() {
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
                Privacy Policy
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
            <ShieldCheck
              size={23}
              aria-hidden="true"
            />
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            Privacy Policy
          </h1>

          <p className="mt-3 text-sm text-zinc-500">
            Effective: September 24, 2026
          </p>

          <p className="mt-6 max-w-2xl leading-7 text-zinc-600">
            Abang PH is a rental management application designed
            to help landlords organize properties, tenants, rent,
            payments, and expenses. This policy explains what
            information is handled when you use Abang PH.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-7 text-zinc-700">
          <Section
            title="1. Information we collect"
          >
            <p>
              When you create an account, Abang PH may store
              information such as your name, email address, phone
              number, and authentication information required to
              operate your account.
            </p>

            <p>
              When you use the application, you may also enter
              information about your rental business, including
              properties, rooms, rentable spaces, tenants, leases,
              rent charges, payments, and expenses.
            </p>
          </Section>

          <Section
            title="2. Tenant information"
          >
            <p>
              Landlords may enter tenant information such as a
              tenant&apos;s name, phone number, email address,
              emergency contact information, lease details, and
              payment records.
            </p>

            <p>
              You should only enter information that you are
              authorized to collect and use for managing your
              rental business.
            </p>
          </Section>

          <Section
            title="3. How information is used"
          >
            <p>
              Information stored in Abang PH is used to provide
              features such as property management, tenant records,
              occupancy tracking, rent monitoring, payment history,
              expense tracking, reports, authentication, security,
              and customer support.
            </p>
          </Section>

          <Section
            title="4. Payments"
          >
            <p>
              Abang PH currently records rental payments that
              landlords receive through methods such as cash,
              GCash, Maya, bank transfer, or other payment methods.
            </p>

            <p>
              Abang PH does not currently process or hold tenant
              rent payments on behalf of landlords.
            </p>
          </Section>

          <Section
            title="5. Account security"
          >
            <p>
              Abang PH uses authentication and server-side access
              controls intended to prevent one landlord from
              accessing another landlord&apos;s rental records.
            </p>

            <p>
              You are responsible for keeping your account
              credentials confidential and for notifying us if you
              believe your account has been accessed without your
              permission.
            </p>
          </Section>

          <Section
            title="6. Service providers"
          >
            <p>
              Abang PH may rely on third-party infrastructure and
              hosting providers to operate the application,
              database, authentication, monitoring, and related
              technical services.
            </p>

            <p>
              These providers may process limited information as
              necessary to provide those services.
            </p>
          </Section>

          <Section
            title="7. Demo environment"
          >
            <p>
              The public Abang PH live demo contains fictional
              sample information. Visitors should not enter real
              personal, tenant, financial, or confidential
              information into the demo environment.
            </p>
          </Section>

          <Section
            title="8. Data retention"
          >
            <p>
              Information may be retained while your account is
              active and for a reasonable period afterward when
              necessary for security, backups, record integrity,
              dispute handling, or legal obligations.
            </p>
          </Section>

          <Section
            title="9. Your responsibilities"
          >
            <p>
              You are responsible for the accuracy of information
              you enter into Abang PH and for having an appropriate
              basis to store tenant or other third-party
              information.
            </p>
          </Section>

          <Section
            title="10. Changes to this policy"
          >
            <p>
              This Privacy Policy may be updated as Abang PH
              changes. When material changes are made, the effective
              date shown on this page will be updated.
            </p>
          </Section>

          <Section
            title="11. Contact"
          >
            <p>
              If you have questions about privacy, your account, or
              information stored in Abang PH, contact:
            </p>

            <a
              href="mailto:mmanrusiana@gmail.com?subject=Abang%20PH%20Privacy"
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

      <LegalFooter />
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

function LegalFooter() {
  return (
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
  );
}