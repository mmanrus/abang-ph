import Link from "next/link";

import {
    Plus,
    Receipt,
    Search,
    X,
} from "lucide-react";

import type {
    Prisma,
} from "@/generated/prisma/client";

import {
    requireLandlord,
} from "@/lib/auth/require-landlord";

import {
    prisma,
} from "@/lib/db/prisma";

import {
    formatPHP,
    moneyToCents,
} from "@/lib/money";

import {
    getCurrentManilaPeriod,
} from "@/lib/billing-date";

import {
    formatRentPeriod,
    getRentPeriodLabel,
    parseRentPeriod,
    shiftRentPeriod,
} from "@/lib/rent-period";
import {
    SuccessBanner,
} from "@/components/feedback/success-banner";
import { getSkip, getTotalPages, PAGE_SIZE, parsePage } from "@/lib/pagination";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, DataTableColumn } from "@/components/ui/data-table";
import type {
  Metadata,
} from "next";

export const metadata: Metadata = {
  title: "Expenses",
};
type Props = {
    searchParams: Promise<{
        q?: string;

        propertyId?: string;

        category?: string;

        period?: string;

        success?: string;
        page?: string;
    }>;
};

/**
 * Expense categories that the application supports.
 *
 * SECURITY / VALIDATION
 * ---------------------
 *
 * Query parameters come from the browser.
 *
 * Someone could manually type:
 *
 *   ?category=SUPER_SECRET_CATEGORY
 *
 * We do not pass arbitrary strings directly into Prisma.
 *
 * Instead, we whitelist values that our application
 * actually understands.
 */
const expenseCategories = [
    "MAINTENANCE",
    "REPAIR",
    "ELECTRICITY",
    "WATER",
    "INTERNET",
    "SALARY",
    "SUPPLIES",
    "TAX",
    "OTHER",
] as const;

type ExpenseCategoryFilter =
    (typeof expenseCategories)[number];

export default async function ExpensesPage({
    searchParams,
}: Props) {
    const params =
        await searchParams;

    const {
        landlord,
    } =
        await requireLandlord();

    /**
     * SEARCH VALUE
     *
     * "   water bill   "
     *
     * becomes:
     *
     * "water bill"
     */
    const q =
        params.q?.trim() ?? "";

    /**
     * CATEGORY VALIDATION
     *
     * Only allow one of our known enum values.
     */
    const requestedCategory =
        params.category as
        | ExpenseCategoryFilter
        | undefined;

    const category:
        ExpenseCategoryFilter | undefined =
        requestedCategory &&
            expenseCategories.includes(
                requestedCategory,
            )
            ? requestedCategory
            : undefined;

    /**
     * MONTH FILTER
     * ------------
     *
     * Examples:
     *
     *   2026-09
     *   2026-10
     *
     * Invalid values fall back to the current Manila month.
     */
    const currentPeriod =
        getCurrentManilaPeriod();

    const selectedPeriod =
        parseRentPeriod(
            params.period,
        ) ??
        currentPeriod;

    const periodStart =
        new Date(
            Date.UTC(
                selectedPeriod.year,
                selectedPeriod.month - 1,
                1,
            ),
        );


    /**
     * We use the next month's first day as an EXCLUSIVE boundary.
     *
     * Example:
     *
     * September query:
     *
     * >= Sep 1
     * <  Oct 1
     *
     * This is cleaner than trying to calculate:
     *
     * Sep 30 at 23:59:59.999
     */
    const nextPeriod =
        shiftRentPeriod(
            selectedPeriod,
            1,
        );

    const nextPeriodStart =
        new Date(
            Date.UTC(
                nextPeriod.year,
                nextPeriod.month - 1,
                1,
            ),
        );

    const periodValue =
        formatRentPeriod(
            selectedPeriod,
        );

    const currentPeriodValue =
        formatRentPeriod(
            currentPeriod,
        );

    const periodLabel =
        getRentPeriodLabel(
            selectedPeriod,
        );

    /**
     * PROPERTY PARAMETER VALIDATION
     * -----------------------------
     *
     * propertyId is browser-controlled.
     *
     * Before using it as a filter, make sure it belongs
     * to this landlord's property list.
     *
     * This isn't our only security layer—the Expense query
     * itself is also landlord-scoped—but validating here gives
     * us predictable behavior for malformed URLs.
     */
    const requestedPropertyId =
        params.propertyId?.trim();
    const properties =
        await prisma.property.findMany({
            where: {
                landlordAccountId:
                    landlord.id,
            },

            orderBy: [
                {
                    isActive:
                        "desc",
                },

                {
                    name:
                        "asc",
                },
            ],

            select: {
                id: true,

                name: true,

                isActive:
                    true,

                deletedAt:
                    true,
            },
        });
    const propertyId =
        requestedPropertyId &&
            properties.some(
                (property) =>
                    property.id ===
                    requestedPropertyId,
            )
            ? requestedPropertyId
            : undefined;

    const expenseWhere = {
        landlordAccountId:
            landlord.id,

        deletedAt:
            null,

        expenseDate: {
            gte:
                periodStart,

            lt:
                nextPeriodStart,
        },

        ...(propertyId
            ? {
                propertyId,
            }
            : {}),

        ...(category
            ? {
                category,
            }
            : {}),

        ...(q
            ? {
                OR: [
                    {
                        description: {
                            contains:
                                q,

                            mode:
                                "insensitive",
                        },
                    },

                    {
                        notes: {
                            contains:
                                q,

                            mode:
                                "insensitive",
                        },
                    },

                    {
                        property: {
                            is: {
                                name: {
                                    contains:
                                        q,

                                    mode:
                                        "insensitive",
                                },
                            },
                        },
                    },
                ],
            }
            : {}),
    } satisfies Prisma.ExpenseWhereInput;
    /**
     * PROPERTY FILTER OPTIONS
     * -----------------------
     *
     * Notice that we intentionally include archived properties.
     *
     * Why?
     *
     * An archived property may still have historical expenses.
     *
     * Example:
     *
     * Rusiana Old Boarding House
     *     ↓
     * archived in 2027
     *
     * Its 2026 water bills still need to remain searchable.
     */



    const requestedPage =
        parsePage(
            params.page,
        );

    const [
        totalExpenses,
        expenseAggregate,
    ] =
        await Promise.all([
            prisma.expense.count({
                where:
                    expenseWhere,
            }),

            /**
             * Financial summary should cover ALL filtered
             * expenses—not only the current page.
             */
            prisma.expense.aggregate({
                where:
                    expenseWhere,

                _sum: {
                    amount:
                        true,
                },
            }),
        ]);

    const totalPages =
        getTotalPages(
            totalExpenses,
        );

    const page =
        Math.min(
            requestedPage,
            totalPages,
        );

    const expenses =
        await prisma.expense.findMany({
            where:
                expenseWhere,

            skip:
                getSkip(page),

            take:
                PAGE_SIZE,

            orderBy: [
                {
                    expenseDate:
                        "desc",
                },

                {
                    createdAt:
                        "desc",
                },
            ],

            include: {
                property:
                    true,
            },
        });

    /**
     * FINANCIAL TOTAL
     * ---------------
     *
     * Calculate using integer centavos.
     *
     * Never:
     *
     *   Number(expense.amount)
     *   +
     *   Number(otherExpense.amount)
     *
     * for financial truth.
     */
    const filteredTotal =
        moneyToCents(
            expenseAggregate
                ._sum
                .amount ??
            "0",
        );
    const hasFilters =
        Boolean(q) ||
        Boolean(propertyId) ||
        Boolean(category) ||
        periodValue !==
        currentPeriodValue;
    type ExpenseRow =
        (typeof expenses)[number];

    const expenseColumns:
        DataTableColumn<ExpenseRow>[] =
        [
            {
                key: "date",

                header: "Date",

                cell: (expense) => (
                    <span className="whitespace-nowrap text-zinc-600">
                        {expense.expenseDate.toLocaleDateString(
                            "en-PH",
                            {
                                year:
                                    "numeric",

                                month:
                                    "short",

                                day:
                                    "numeric",

                                timeZone:
                                    "Asia/Manila",
                            },
                        )}
                    </span>
                ),
            },

            {
                key: "description",

                header:
                    "Description",

                cell: (expense) => (
                    <div className="min-w-[220px] max-w-md">
                        <p className="font-medium text-zinc-950">
                            {
                                expense.description
                            }
                        </p>

                        {expense.notes && (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">
                                {
                                    expense.notes
                                }
                            </p>
                        )}
                    </div>
                ),
            },

            {
                key: "property",

                header:
                    "Property",

                cell: (expense) => (
                    <div>
                        <p className="font-medium text-zinc-700">
                            {
                                expense.property
                                    .name
                            }
                        </p>

                        {!expense.property
                            .isActive && (
                                <p className="mt-0.5 text-xs text-zinc-400">
                                    Archived
                                </p>
                            )}
                    </div>
                ),
            },

            {
                key: "category",

                header:
                    "Category",

                cell: (expense) => (
                    <span className="inline-flex whitespace-nowrap rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                        {formatCategory(
                            expense.category,
                        )}
                    </span>
                ),
            },

            {
                key: "amount",

                header:
                    "Amount",

                headerClassName:
                    "text-right",

                className:
                    "text-right",

                cell: (expense) => (
                    <span className="whitespace-nowrap font-semibold text-red-700">
                        -
                        {formatPHP(
                            moneyToCents(
                                expense.amount,
                            ),
                        )}
                    </span>
                ),
            },
        ];
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                        Expenses
                    </h1>

                    <p className="mt-1 text-sm text-zinc-500">
                        Track and review operating
                        expenses across your rental
                        properties.
                    </p>
                </div>

                <Link
                    href="/expenses/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                    <Plus
                        size={18}
                    />

                    <span className="hidden sm:inline">
                        Add expense
                    </span>
                </Link>
            </div>
            <div className="mt-6">
                <SuccessBanner
                    code={
                        params.success
                    }
                />
            </div>
            {/* FILTER BAR */}
            <form
                method="GET"
                className="mt-6 grid gap-3 xl:grid-cols-[1fr_220px_190px_180px_auto_auto]"
            >
                {/* SEARCH */}
                <div className="relative">
                    <Search
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    />

                    <input
                        type="search"
                        name="q"
                        defaultValue={
                            q
                        }
                        placeholder="Search description, notes, property..."
                        className="w-full rounded-xl border border-zinc-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                    />
                </div>

                {/* PROPERTY */}
                <select
                    name="propertyId"
                    defaultValue={
                        propertyId ?? ""
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-500"
                >
                    <option value="">
                        All properties
                    </option>

                    {properties.map(
                        (property) => (
                            <option
                                key={
                                    property.id
                                }
                                value={
                                    property.id
                                }
                            >
                                {property.name}

                                {!property.isActive
                                    ? " (Archived)"
                                    : ""}
                            </option>
                        ),
                    )}
                </select>

                {/* CATEGORY */}
                <select
                    name="category"
                    defaultValue={
                        category ?? ""
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-500"
                >
                    <option value="">
                        All categories
                    </option>

                    {expenseCategories.map(
                        (item) => (
                            <option
                                key={
                                    item
                                }
                                value={
                                    item
                                }
                            >
                                {formatCategory(
                                    item,
                                )}
                            </option>
                        ),
                    )}
                </select>

                {/* MONTH */}
                <input
                    type="month"
                    name="period"
                    defaultValue={
                        periodValue
                    }
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-500"
                />

                <button
                    type="submit"
                    className="rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                    Search
                </button>

                {hasFilters && (
                    <Link
                        href="/expenses"
                        aria-label="Clear filters"
                        className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
                    >
                        <X
                            size={17}
                        />
                    </Link>
                )}
            </form>

            {/* MONTH / FILTER SUMMARY */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                <span className="font-medium text-zinc-700">
                    {periodLabel}
                </span>

                <span>·</span>

                <span>
                    {totalExpenses}{" "}
                    {totalExpenses === 1
                        ? "expense"
                        : "expenses"}
                </span>

                {q && (
                    <>
                        <span>·</span>

                        <span className="rounded-lg bg-zinc-100 px-2 py-1 font-medium text-zinc-700">
                            &quot;
                            {q}
                            &quot;
                        </span>
                    </>
                )}
            </div>

            {/* TOTAL */}
            <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm text-zinc-500">
                            {hasFilters
                                ? "Filtered expenses"
                                : "Expenses this month"}
                        </p>

                        <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-950">
                            {formatPHP(
                                filteredTotal,
                            )}
                        </p>
                    </div>

                    <p className="text-sm text-zinc-500">
                        {totalExpenses}{" "}
                        {totalExpenses ===
                            1
                            ? "record"
                            : "records"}
                    </p>
                </div>
            </section>

            {/* RESULTS */}
            {/* RESULTS */}
            {expenses.length === 0 ? (
                <ExpenseEmptyState
                    hasFilters={
                        hasFilters
                    }
                    periodLabel={
                        periodLabel
                    }
                />
            ) : (
                <div className="mt-6 space-y-4">
                    {/*
     * MOBILE VIEW
     * -----------
     *
     * Cards are easier to scan on narrow screens.
     */}
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm lg:hidden">
                        <div className="divide-y divide-zinc-100">
                            {expenses.map(
                                (expense) => (
                                    <div
                                        key={
                                            expense.id
                                        }
                                        className="flex flex-col justify-between gap-4 px-5 py-4 sm:flex-row sm:items-center sm:px-6"
                                    >
                                        {/* LEFT SIDE */}
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-medium text-zinc-950">
                                                    {
                                                        expense.description
                                                    }
                                                </p>

                                                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                                                    {formatCategory(
                                                        expense.category,
                                                    )}
                                                </span>
                                            </div>

                                            <p className="mt-1 text-sm text-zinc-500">
                                                {
                                                    expense.property
                                                        .name
                                                }

                                                {!expense
                                                    .property
                                                    .isActive && (
                                                        <span className="text-zinc-400">
                                                            {" "}
                                                            · Archived
                                                            property
                                                        </span>
                                                    )}
                                            </p>

                                            <p className="mt-1 text-xs text-zinc-400">
                                                {expense.expenseDate.toLocaleDateString(
                                                    "en-PH",
                                                    {
                                                        year:
                                                            "numeric",

                                                        month:
                                                            "short",

                                                        day:
                                                            "numeric",

                                                        timeZone:
                                                            "Asia/Manila",
                                                    },
                                                )}
                                            </p>

                                            {expense.notes && (
                                                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-zinc-500">
                                                    {
                                                        expense.notes
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        {/* AMOUNT */}
                                        <div className="shrink-0 text-left sm:text-right">
                                            <p className="font-semibold text-red-700">
                                                -
                                                {formatPHP(
                                                    moneyToCents(
                                                        expense.amount,
                                                    ),
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>

                    {/*
                    * DESKTOP VIEW
                    * ------------
                    *
                    * Once the screen is large enough,
                    * a table is more space-efficient and
                    * makes hundreds of records easier to scan.
                    */}
                    <div className="hidden lg:block">
                        <DataTable
                            rows={
                                expenses
                            }
                            columns={
                                expenseColumns
                            }
                            rowKey={(
                                expense,
                            ) =>
                                expense.id
                            }
                        />
                    </div>

                                    {/*
                    * Pagination belongs outside both layouts.
                    *
                    * This way mobile cards and the desktop
                    * DataTable share exactly the same page state.
                    */}
                    <Pagination
                        basePath="/expenses"
                        page={
                            page
                        }
                        totalPages={
                            totalPages
                        }
                        totalItems={
                            totalExpenses
                        }
                        pageSize={
                            PAGE_SIZE
                        }
                        query={{
                            q:
                                q ||
                                undefined,

                            propertyId,

                            category,

                            period:
                                periodValue ===
                                    currentPeriodValue
                                    ? undefined
                                    : periodValue,
                        }}
                    />
                </div>
            )}
        </div>
    );
}

/**
 * Converts:
 *
 * BANK_TRANSFER-like enum naming style
 *
 * into:
 *
 * Bank Transfer-like display labels.
 *
 * Our current categories are mostly single words,
 * but this helper keeps display formatting centralized.
 */
function formatCategory(
    category: string,
) {
    return category
        .replaceAll(
            "_",
            " ",
        )
        .toLowerCase()
        .replace(
            /\b\w/g,
            (character) =>
                character.toUpperCase(),
        );
}

function ExpenseEmptyState({
    hasFilters,
    periodLabel,
}: {
    hasFilters: boolean;
    periodLabel: string;
}) {
    if (
        hasFilters
    ) {
        return (
            <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
                <Search
                    size={36}
                    className="mx-auto text-zinc-400"
                />

                <h2 className="mt-4 font-semibold text-zinc-950">
                    No expenses found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                    No expense records match the
                    current search and filters for{" "}
                    {periodLabel}.
                </p>

                <Link
                    href="/expenses"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                    <X
                        size={16}
                    />

                    Clear filters
                </Link>
            </div>
        );
    }

    return (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <Receipt
                size={38}
                className="mx-auto text-zinc-400"
            />

            <h2 className="mt-4 font-semibold text-zinc-950">
                No expenses this month
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                No expenses have been recorded for{" "}
                {periodLabel}.
            </p>

            <Link
                href="/expenses/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
                <Plus
                    size={17}
                />

                Add expense
            </Link>
        </div>
    );
}