import "server-only";

import { prisma } from "@/lib/db/prisma";
import { moneyToCents } from "@/lib/money";
import {
    AppError,
} from "@/lib/errors";
/**
 * ExpenseService
 * --------------
 *
 * Expenses are financial records, so we validate them on the server.
 *
 * IMPORTANT:
 * Never trust:
 *
 *   propertyId
 *   amount
 *   category
 *
 * just because they came from our React form.
 *
 * A browser request can always be manually modified.
 */

type ExpenseCategory =
    | "MAINTENANCE"
    | "REPAIR"
    | "ELECTRICITY"
    | "WATER"
    | "INTERNET"
    | "SALARY"
    | "SUPPLIES"
    | "TAX"
    | "OTHER";

type CreateExpenseInput = {
    landlordAccountId: string;

    propertyId: string;

    category: ExpenseCategory;

    description: string;

    amount: string;

    expenseDate: Date;

    notes?: string | null;
};

export async function createExpense(
    input: CreateExpenseInput,
) {
    const description =
        input.description.trim();

    if (!description) {
        throw new AppError(
            "Expense description is required.",
        );
    }

    /**
     * MONEY VALIDATION
     *
     * We convert the amount into integer centavos first.
     *
     * Example:
     *
     * ₱1,250.75
     *
     * becomes:
     *
     * 125075n
     *
     * This prevents floating-point money errors.
     */
    const amount =
        moneyToCents(
            input.amount,
        );

    if (amount <= 0n) {
        throw new AppError(
            "Expense amount must be greater than zero.",
        );
    }

    /**
     * DATA ISOLATION
     *
     * propertyId comes from the browser.
     *
     * So checking:
     *
     *   Property.id = propertyId
     *
     * is NOT enough.
     *
     * We must also prove:
     *
     *   Property.landlordAccountId = authenticated landlord
     *
     * Otherwise Landlord A could potentially submit
     * Landlord B's property ID.
     */
    const property =
        await prisma.property.findFirst({
            where: {
                id:
                    input.propertyId,

                landlordAccountId:
                    input.landlordAccountId,

                deletedAt: null,

                isActive: true,
            },

            select: {
                id: true,
            },
        });

    if (!property) {
        throw new AppError(
            "Property not found.",
        );
    }

    return prisma.expense.create({
        data: {
            landlordAccountId:
                input.landlordAccountId,

            propertyId:
                property.id,

            category:
                input.category,

            description,

            amount:
                input.amount,

            expenseDate:
                input.expenseDate,

            notes:
                input.notes?.trim() ||
                null,
        },
    });
}