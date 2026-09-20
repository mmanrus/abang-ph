import Link from "next/link";

import {
    ArrowLeft,
    CalendarDays,
    CreditCard,
    FileText,
    UserRound,
} from "lucide-react";

import {
    notFound,
} from "next/navigation";

import {
    requireLandlord,
} from "@/lib/auth/require-landlord";

import {
    prisma,
} from "@/lib/db/prisma";
import {
    SuccessBanner,
} from "@/components/feedback/success-banner";
import {
    formatPHP,
    moneyToCents,
} from "@/lib/money";

import {
    voidPaymentAction,
} from "../actions";
import { ConfirmForm } from "@/components/forms/confirm-form";
import { SubmitButton } from "@/components/forms/submit-button";

type Props = {
    params: Promise<{
        paymentId: string;
    }>;

    searchParams: Promise<{
        success?: string;
    }>;
};

export default async function PaymentPage({
    params,
    searchParams,
}: Props) {
    const {
        paymentId,
    } =
        await params;
    const query =
        await searchParams;
    const { landlord } =
        await requireLandlord();

    /**
     * SECURITY:
     *
     * Even if somebody manually tries:
     *
     * /payments/ANOTHER_USERS_PAYMENT_ID
     *
     * the query also requires:
     *
     * landlordAccountId = currently authenticated landlord
     *
     * so another landlord's record will not be returned.
     */
    const payment =
        await prisma.payment.findFirst({
            where: {
                id:
                    paymentId,

                landlordAccountId:
                    landlord.id,
            },

            include: {
                tenant: true,

                allocations: {
                    include: {
                        rentCharge: {
                            include: {
                                lease: {
                                    include: {
                                        rentableSpace: {
                                            include: {
                                                unit: {
                                                    include: {
                                                        property:
                                                            true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

    if (!payment) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Link
                href="/payments"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
            >
                <ArrowLeft
                    size={17}
                />

                Payments
            </Link>
            <SuccessBanner
                code={
                    query.success
                }
            />
            <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                            Payment
                        </h1>

                        {payment.voidedAt && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                                VOIDED
                            </span>
                        )}
                    </div>

                    <p className="mt-2 text-sm text-zinc-500">
                        Recorded{" "}
                        {payment.createdAt.toLocaleString(
                            "en-PH",
                        )}
                    </p>
                </div>

                <p
                    className={[
                        "text-3xl font-semibold tracking-tight",
                        payment.voidedAt
                            ? "text-zinc-400 line-through"
                            : "text-zinc-950",
                    ].join(" ")}
                >
                    {formatPHP(
                        moneyToCents(
                            payment.amount,
                        ),
                    )}
                </p>
            </div>

            <section className="mt-7 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                    <Detail
                        icon={UserRound}
                        label="Tenant"
                        value={
                            payment.tenant.fullName
                        }
                    />

                    <Detail
                        icon={CreditCard}
                        label="Payment method"
                        value={
                            payment.method.replaceAll(
                                "_",
                                " ",
                            )
                        }
                    />

                    <Detail
                        icon={CalendarDays}
                        label="Date received"
                        value={payment.paidAt.toLocaleDateString(
                            "en-PH",
                        )}
                    />

                    <Detail
                        icon={FileText}
                        label="Reference"
                        value={
                            payment.referenceNumber ??
                            "No reference"
                        }
                    />
                </div>

                {payment.notes && (
                    <div className="mt-6 border-t border-zinc-100 pt-5">
                        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                            Notes
                        </p>

                        <p className="mt-2 text-sm text-zinc-700">
                            {payment.notes}
                        </p>
                    </div>
                )}
            </section>

            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
                    <h2 className="font-semibold text-zinc-950">
                        Allocation
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        Shows exactly which rent
                        charges this payment was
                        applied to.
                    </p>
                </div>

                <div className="divide-y divide-zinc-100">
                    {payment.allocations.map(
                        (allocation) => {
                            const charge =
                                allocation.rentCharge;

                            const location = [
                                charge.lease
                                    .rentableSpace
                                    .unit
                                    .property
                                    .name,

                                charge.lease
                                    .rentableSpace
                                    .unit.name,

                                charge.lease
                                    .rentableSpace
                                    .name,
                            ].join(" · ");

                            const month =
                                new Intl.DateTimeFormat(
                                    "en-PH",
                                    {
                                        month:
                                            "long",

                                        year:
                                            "numeric",

                                        timeZone:
                                            "Asia/Manila",
                                    },
                                ).format(
                                    new Date(
                                        Date.UTC(
                                            charge.periodYear,
                                            charge.periodMonth -
                                            1,
                                            1,
                                        ),
                                    ),
                                );

                            return (
                                <div
                                    key={
                                        allocation.id
                                    }
                                    className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                                >
                                    <div>
                                        <p className="font-medium text-zinc-950">
                                            {month}
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-500">
                                            {location}
                                        </p>
                                    </div>

                                    <p className="font-semibold text-zinc-950">
                                        {formatPHP(
                                            moneyToCents(
                                                allocation.amount,
                                            ),
                                        )}
                                    </p>
                                </div>
                            );
                        },
                    )}
                </div>
            </section>

            {payment.voidedAt ? (
                <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
                    <p className="font-medium text-red-900">
                        Payment voided
                    </p>

                    <p className="mt-2 text-sm text-red-800">
                        {payment.voidReason ??
                            "No reason recorded."}
                    </p>

                    <p className="mt-1 text-xs text-red-600">
                        {payment.voidedAt.toLocaleString(
                            "en-PH",
                        )}
                    </p>
                </section>
            ) : (
                <section className="mt-6 rounded-2xl border border-red-200 bg-white p-5">
                    <h2 className="font-semibold text-zinc-950">
                        Void payment
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
                        Use this when a payment was
                        entered by mistake. Abang keeps
                        the original payment for audit
                        history but removes it from
                        collection totals.
                    </p>

                    <ConfirmForm
                        action={voidPaymentAction.bind(
                            null,
                            payment.id,
                        )}
                        message="Void this payment? It will be removed from collection totals and affected rent balances will be recalculated."
                        className="mt-5 space-y-4"
                    >
                        <div>
                            <label className="mb-2 block text-sm font-medium text-zinc-800">
                                Reason
                            </label>

                            <textarea
                                name="reason"
                                required
                                minLength={3}
                                rows={3}
                                placeholder="Example: Payment entered twice"
                                className="w-full resize-none rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                            />
                        </div>

                        <SubmitButton
                            pendingText="Voiding payment..."
                            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                        >
                            Void payment
                        </SubmitButton>
                    </ConfirmForm>
                </section>
            )}
        </div>
    );
}

function Detail({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
                <Icon size={17} />
            </div>

            <div>
                <p className="text-xs text-zinc-500">
                    {label}
                </p>

                <p className="mt-1 text-sm font-medium text-zinc-950">
                    {value}
                </p>
            </div>
        </div>
    );
}