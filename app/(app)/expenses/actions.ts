"use server";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  createExpense,
} from "@/server/services/expense.service";

import {
  ActionState,
} from "@/lib/action-state";

import {
  AppError,
  getUserSafeErrorMessage,
} from "@/lib/errors";

import {
  revalidatePath,
} from "next/cache";

import {
  redirect,
} from "next/navigation";
import { requireWritableLandlord } from "@/lib/auth/require-writable-landlord";

const expenseCategories = {
  MAINTENANCE:
    "MAINTENANCE",

  REPAIR:
    "REPAIR",

  ELECTRICITY:
    "ELECTRICITY",

  WATER:
    "WATER",

  INTERNET:
    "INTERNET",

  SALARY:
    "SALARY",

  SUPPLIES:
    "SUPPLIES",

  TAX:
    "TAX",

  OTHER:
    "OTHER",
} as const;

function parseDate(
  value: string,
) {
  const date =
    new Date(
      `${value}T00:00:00.000Z`,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    throw new AppError(
      "Please enter a valid expense date.",
    );
  }

  return date;
}

export async function createExpenseAction(
  _previousState:
    ActionState,

  formData:
    FormData,
): Promise<ActionState> {
  /**
   * AUTHORIZATION
   * -------------
   *
   * Authentication happens BEFORE processing the form.
   *
   * The user cannot submit:
   *
   * landlordAccountId = "somebody-else"
   *
   * because landlord identity comes from the server session.
   */
  const {
    landlord,
  } =
    await requireWritableLandlord();

  try {
    const propertyId =
      String(
        formData.get(
          "propertyId",
        ) ?? "",
      ).trim();

    if (!propertyId) {
      throw new AppError(
        "Please select a property.",
      );
    }

    const categoryInput =
      String(
        formData.get(
          "category",
        ) ?? "",
      );

    const category =
      expenseCategories[
        categoryInput as keyof typeof expenseCategories
      ];

    if (!category) {
      throw new AppError(
        "Please select a valid expense category.",
      );
    }

    await createExpense({
      landlordAccountId:
        landlord.id,

      propertyId,

      category,

      description:
        String(
          formData.get(
            "description",
          ) ?? "",
        ),

      amount:
        String(
          formData.get(
            "amount",
          ) ?? "",
        ),

      expenseDate:
        parseDate(
          String(
            formData.get(
              "expenseDate",
            ) ?? "",
          ),
        ),

      notes:
        String(
          formData.get(
            "notes",
          ) ?? "",
        ),
    });
  } catch (error) {
    /**
     * IMPORTANT:
     *
     * We catch normal business/validation failures
     * and return them to the form.
     *
     * Unknown errors get converted to a generic
     * user-safe message.
     */
    return {
      status: "error",
      message:
        getUserSafeErrorMessage(
          error,
        ),
    };
  }

  /**
   * Do NOT put redirect() inside the try/catch above.
   *
   * Next.js implements redirect using special internal
   * control-flow behavior.
   *
   * Catching it accidentally can break redirects.
   */
  revalidatePath(
    "/expenses",
  );

  revalidatePath(
    "/dashboard",
  );

  revalidatePath(
    "/reports",
  );

  redirect(
    "/expenses?success=expense-created",
  );
}