import Link from "next/link";

import {
    ArrowLeft,
} from "lucide-react";

import {
    getManilaToday,
} from "@/lib/billing-date";

import {
    CreateExpenseForm,
} from "@/components/expenses/create-expense-form";
function todayInput() {
    const date =
        getManilaToday();

    return [
        date.getUTCFullYear(),

        String(
            date.getUTCMonth() + 1,
        ).padStart(2, "0"),

        String(
            date.getUTCDate(),
        ).padStart(2, "0"),
    ].join("-");
}

export default function NewExpensePage() {
    

    return (
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Link
                href="/expenses"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600"
            >
                <ArrowLeft size={17} />

                Expenses
            </Link>

            <div className="mt-5">
                <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                    Add expense
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                    Record a property expense.
                </p>
            </div>
            <CreateExpenseForm
                today={
                    todayInput()
                }
            />
        </div>
    );
}