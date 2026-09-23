import "dotenv/config";

import {
  PrismaPg,
} from "@prisma/adapter-pg";

import {
  PrismaClient,
} from "../generated/prisma/client";

/**
 * ============================================================
 * ABANG PH — LIVE DEMO SEED
 * ============================================================
 *
 * PURPOSE
 * -------
 *
 * This seed prepares the dedicated Abang PH live-demo landlord.
 *
 * IMPORTANT:
 *
 * - It DOES NOT create the Better Auth user.
 * - It DOES NOT create passwords.
 * - It DOES NOT delete the database.
 * - It DOES NOT touch another landlord.
 *
 * The demo user must already exist through the normal
 * Better Auth registration + onboarding flow.
 *
 * At the very end we set:
 *
 *   landlord.isDemo = true
 *
 * This activates our server-side read-only protection through:
 *
 *   requireWritableLandlord()
 *
 * ============================================================
 */

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not defined.",
  );
}

const adapter =
  new PrismaPg({
    connectionString,
  });

const prisma =
  new PrismaClient({
    adapter,
  });

type BillingPeriod = {
  year: number;
  month: number;
};

/**
 * Get the current billing month in Philippine time.
 *
 * Why not simply use:
 *
 *   new Date().getMonth()
 *
 * Because a deployment/server may run in UTC.
 *
 * Example:
 *
 *   Manila: October 1, 12:30 AM
 *   UTC:    September 30, 4:30 PM
 *
 * We want Abang demo rent records to follow Manila time.
 */
function getCurrentManilaPeriod():
  BillingPeriod {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Manila",

        year:
          "numeric",

        month:
          "numeric",
      },
    ).formatToParts(
      new Date(),
    );

  const year =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "year",
      )?.value,
    );

  const month =
    Number(
      parts.find(
        (part) =>
          part.type ===
          "month",
      )?.value,
    );

  if (
    !year ||
    !month
  ) {
    throw new Error(
      "Could not determine the current Manila billing period.",
    );
  }

  return {
    year,
    month,
  };
}

/**
 * Move forward/backward by billing months.
 *
 * Example:
 *
 * September 2026 + (-1)
 *        ↓
 * August 2026
 */
function shiftPeriod(
  period: BillingPeriod,
  months: number,
): BillingPeriod {
  const date =
    new Date(
      Date.UTC(
        period.year,
        period.month - 1 + months,
        1,
      ),
    );

  return {
    year:
      date.getUTCFullYear(),

    month:
      date.getUTCMonth() +
      1,
  };
}

/**
 * Store calendar dates consistently.
 *
 * We use UTC midnight for our seeded date-only values.
 */
function createDate(
  year: number,
  month: number,
  day: number,
) {
  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      0,
      0,
      0,
    ),
  );
}

async function main() {
  console.log("");
  console.log(
    "🏠 Preparing Abang PH live demo...",
  );
  console.log("");

  const demoEmail =
    process.env.DEMO_EMAIL
      ?.trim()
      .toLowerCase();

  if (!demoEmail) {
    throw new Error(
      "DEMO_EMAIL is not defined.",
    );
  }

  /**
   * SIMPLE SAFETY GUARD
   * -------------------
   *
   * This is not an authentication mechanism.
   *
   * It simply reduces the chance that somebody accidentally
   * points DEMO_EMAIL at a normal landlord account.
   */
  if (
    !demoEmail.includes(
      "demo",
    )
  ) {
    throw new Error(
      "For safety, DEMO_EMAIL must contain the word \"demo\".",
    );
  }

  /**
   * BETTER AUTH
   * -----------
   *
   * We FIND the existing user instead of creating one.
   *
   * Better Auth has already created:
   *
   * User
   * Account
   * hashed password
   * authentication records
   *
   * We should not manually reproduce those records.
   */
  const user =
    await prisma.user.findUnique({
      where: {
        email:
          demoEmail,
      },

      include: {
        landlordAccount:
          true,
      },
    });

  if (!user) {
    throw new Error(
      `Demo user "${demoEmail}" does not exist. Register it through Abang first.`,
    );
  }

  if (
    !user.landlordAccount
  ) {
    throw new Error(
      "The demo user exists but has not completed landlord onboarding.",
    );
  }

  const landlord =
    user.landlordAccount;

  console.log(
    `✅ Demo user found: ${demoEmail}`,
  );

  console.log(
    `✅ Landlord account found: ${landlord.id}`,
  );

  /**
   * FIRST-SEED SAFETY
   * -----------------
   *
   * This script intentionally does NOT clear existing data.
   *
   * If the target account already contains business data,
   * we stop instead of risking destruction.
   *
   * Later we can build a dedicated:
   *
   *   reset-demo.ts
   *
   * for intentionally resetting the public demo.
   */
  const [
    propertyCount,
    tenantCount,
    paymentCount,
    expenseCount,
  ] =
    await Promise.all([
      prisma.property.count({
        where: {
          landlordAccountId:
            landlord.id,
        },
      }),

      prisma.tenant.count({
        where: {
          landlordAccountId:
            landlord.id,
        },
      }),

      prisma.payment.count({
        where: {
          landlordAccountId:
            landlord.id,
        },
      }),

      prisma.expense.count({
        where: {
          landlordAccountId:
            landlord.id,
        },
      }),
    ]);

  const hasExistingData =
    propertyCount > 0 ||
    tenantCount > 0 ||
    paymentCount > 0 ||
    expenseCount > 0;

  if (hasExistingData) {
    throw new Error(
      [
        "Demo account already contains business data.",
        "",
        `Properties: ${propertyCount}`,
        `Tenants: ${tenantCount}`,
        `Payments: ${paymentCount}`,
        `Expenses: ${expenseCount}`,
        "",
        "Seed stopped to avoid modifying existing records.",
      ].join("\n"),
    );
  }

  const currentPeriod =
    getCurrentManilaPeriod();

  const previousPeriod =
    shiftPeriod(
      currentPeriod,
      -1,
    );

  const leaseStartPeriod =
    shiftPeriod(
      currentPeriod,
      -2,
    );

  /**
   * ==========================================================
   * TRANSACTION
   * ==========================================================
   *
   * Everything below succeeds together or fails together.
   *
   * This prevents us from ending up with:
   *
   * Property ✅
   * Tenants ✅
   * Rent charges ❌
   *
   * if an unexpected database error occurs halfway through.
   */
  await prisma.$transaction(
    async (tx) => {
      /**
       * ------------------------------------------------------
       * DEMO PROFILE
       * ------------------------------------------------------
       */

      await tx.user.update({
        where: {
          id:
            user.id,
        },

        data: {
          name:
            "Demo Landlord",

          phone:
            "09171234567",
        },
      });

      await tx.landlordAccount.update({
        where: {
          id:
            landlord.id,
        },

        data: {
          displayName:
            "Rusiana Rentals",

          phone:
            "09171234567",

          timezone:
            "Asia/Manila",

          currency:
            "PHP",
        },
      });

      /**
       * ------------------------------------------------------
       * PROPERTY
       * ------------------------------------------------------
       */

      const property =
        await tx.property.create({
          data: {
            landlordAccountId:
              landlord.id,

            name:
              "Rusiana Boarding House",

            type:
              "BOARDING_HOUSE",

            addressLine1:
              "123 Sample Street",

            barangay:
              "Lahug",

            city:
              "Cebu City",

            province:
              "Cebu",

            postalCode:
              "6000",

            description:
              "Sample boarding house used for the Abang PH live demo.",
          },
        });

      /**
       * ------------------------------------------------------
       * ROOM 101
       * ------------------------------------------------------
       */

      const room101 =
        await tx.unit.create({
          data: {
            propertyId:
              property.id,

            name:
              "Room 101",

            floor:
              "1",

            description:
              "Three-bed boarding room.",
          },
        });

      const room101BedA =
        await tx.rentableSpace.create({
          data: {
            unitId:
              room101.id,

            name:
              "Bed A",

            defaultRent:
              "4000.00",

            status:
              "OCCUPIED",
          },
        });

      const room101BedB =
        await tx.rentableSpace.create({
          data: {
            unitId:
              room101.id,

            name:
              "Bed B",

            defaultRent:
              "4000.00",

            status:
              "OCCUPIED",
          },
        });

      await tx.rentableSpace.create({
        data: {
          unitId:
            room101.id,

          name:
            "Bed C",

          defaultRent:
            "4000.00",

          status:
            "AVAILABLE",
        },
      });

      /**
       * ------------------------------------------------------
       * ROOM 102
       * ------------------------------------------------------
       */

      const room102 =
        await tx.unit.create({
          data: {
            propertyId:
              property.id,

            name:
              "Room 102",

            floor:
              "1",

            description:
              "Two-bed boarding room.",
          },
        });

      const room102BedA =
        await tx.rentableSpace.create({
          data: {
            unitId:
              room102.id,

            name:
              "Bed A",

            defaultRent:
              "5000.00",

            status:
              "OCCUPIED",
          },
        });

      const room102BedB =
        await tx.rentableSpace.create({
          data: {
            unitId:
              room102.id,

            name:
              "Bed B",

            defaultRent:
              "4000.00",

            status:
              "OCCUPIED",
          },
        });

      /**
       * ------------------------------------------------------
       * TENANTS
       * ------------------------------------------------------
       *
       * All names/contact information below are fictional
       * sample data.
       */

      const juan =
        await tx.tenant.create({
          data: {
            landlordAccountId:
              landlord.id,

            fullName:
              "Juan Dela Cruz",

            phone:
              "09170000001",

            email:
              "juan.demo@example.com",

            emergencyContactName:
              "Ana Dela Cruz",

            emergencyContactPhone:
              "09171000001",

            notes:
              "Sample tenant for the Abang PH live demo.",
          },
        });

      const maria =
        await tx.tenant.create({
          data: {
            landlordAccountId:
              landlord.id,

            fullName:
              "Maria Santos",

            phone:
              "09170000002",

            email:
              "maria.demo@example.com",

            emergencyContactName:
              "Rosa Santos",

            emergencyContactPhone:
              "09171000002",

            notes:
              "Sample tenant for the Abang PH live demo.",
          },
        });

      const carlo =
        await tx.tenant.create({
          data: {
            landlordAccountId:
              landlord.id,

            fullName:
              "Carlo Reyes",

            phone:
              "09170000003",

            email:
              "carlo.demo@example.com",

            notes:
              "Sample tenant for the Abang PH live demo.",
          },
        });

      const anne =
        await tx.tenant.create({
          data: {
            landlordAccountId:
              landlord.id,

            fullName:
              "Anne Garcia",

            phone:
              "09170000004",

            email:
              "anne.demo@example.com",

            notes:
              "Sample tenant for the Abang PH live demo.",
          },
        });

      /**
       * ------------------------------------------------------
       * ACTIVE LEASES
       * ------------------------------------------------------
       */

      const leaseStart =
        createDate(
          leaseStartPeriod.year,
          leaseStartPeriod.month,
          1,
        );

      const juanLease =
        await tx.lease.create({
          data: {
            tenantId:
              juan.id,

            rentableSpaceId:
              room101BedA.id,

            startDate:
              leaseStart,

            monthlyRent:
              "4000.00",

            dueDay:
              5,

            securityDeposit:
              "4000.00",

            status:
              "ACTIVE",

            notes:
              "Live demo lease.",
          },
        });

      const mariaLease =
        await tx.lease.create({
          data: {
            tenantId:
              maria.id,

            rentableSpaceId:
              room101BedB.id,

            startDate:
              leaseStart,

            monthlyRent:
              "4000.00",

            dueDay:
              5,

            securityDeposit:
              "4000.00",

            status:
              "ACTIVE",

            notes:
              "Live demo lease.",
          },
        });

      const carloLease =
        await tx.lease.create({
          data: {
            tenantId:
              carlo.id,

            rentableSpaceId:
              room102BedA.id,

            startDate:
              leaseStart,

            monthlyRent:
              "5000.00",

            dueDay:
              5,

            securityDeposit:
              "5000.00",

            status:
              "ACTIVE",

            notes:
              "Live demo lease.",
          },
        });

      const anneLease =
        await tx.lease.create({
          data: {
            tenantId:
              anne.id,

            rentableSpaceId:
              room102BedB.id,

            startDate:
              leaseStart,

            monthlyRent:
              "4000.00",

            dueDay:
              5,

            securityDeposit:
              "4000.00",

            status:
              "ACTIVE",

            notes:
              "Live demo lease.",
          },
        });

      /**
       * ------------------------------------------------------
       * PREVIOUS MONTH
       * ------------------------------------------------------
       *
       * Having a completed previous month gives Reports and
       * payment history something meaningful to display.
       */

      const previousCharges =
        await Promise.all([
          tx.rentCharge.create({
            data: {
              leaseId:
                juanLease.id,

              periodYear:
                previousPeriod.year,

              periodMonth:
                previousPeriod.month,

              amount:
                "4000.00",

              dueDate:
                createDate(
                  previousPeriod.year,
                  previousPeriod.month,
                  5,
                ),

              status:
                "PAID",
            },
          }),

          tx.rentCharge.create({
            data: {
              leaseId:
                mariaLease.id,

              periodYear:
                previousPeriod.year,

              periodMonth:
                previousPeriod.month,

              amount:
                "4000.00",

              dueDate:
                createDate(
                  previousPeriod.year,
                  previousPeriod.month,
                  5,
                ),

              status:
                "PAID",
            },
          }),

          tx.rentCharge.create({
            data: {
              leaseId:
                carloLease.id,

              periodYear:
                previousPeriod.year,

              periodMonth:
                previousPeriod.month,

              amount:
                "5000.00",

              dueDate:
                createDate(
                  previousPeriod.year,
                  previousPeriod.month,
                  5,
                ),

              status:
                "PAID",
            },
          }),

          tx.rentCharge.create({
            data: {
              leaseId:
                anneLease.id,

              periodYear:
                previousPeriod.year,

              periodMonth:
                previousPeriod.month,

              amount:
                "4000.00",

              dueDate:
                createDate(
                  previousPeriod.year,
                  previousPeriod.month,
                  5,
                ),

              status:
                "PAID",
            },
          }),
        ]);

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            juan.id,

          amount:
            "4000.00",

          method:
            "GCASH",

          paidAt:
            createDate(
              previousPeriod.year,
              previousPeriod.month,
              3,
            ),

          referenceNumber:
            "GCASH-DEMO-PREV-001",

          notes:
            "Sample live-demo payment.",

          allocations: {
            create: {
              rentChargeId:
                previousCharges[0].id,

              amount:
                "4000.00",
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            maria.id,

          amount:
            "4000.00",

          method:
            "CASH",

          paidAt:
            createDate(
              previousPeriod.year,
              previousPeriod.month,
              5,
            ),

          notes:
            "Sample live-demo payment.",

          allocations: {
            create: {
              rentChargeId:
                previousCharges[1].id,

              amount:
                "4000.00",
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            carlo.id,

          amount:
            "5000.00",

          method:
            "BANK_TRANSFER",

          paidAt:
            createDate(
              previousPeriod.year,
              previousPeriod.month,
              5,
            ),

          referenceNumber:
            "BANK-DEMO-PREV-001",

          notes:
            "Sample live-demo payment.",

          allocations: {
            create: {
              rentChargeId:
                previousCharges[2].id,

              amount:
                "5000.00",
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            anne.id,

          amount:
            "4000.00",

          method:
            "MAYA",

          paidAt:
            createDate(
              previousPeriod.year,
              previousPeriod.month,
              7,
            ),

          referenceNumber:
            "MAYA-DEMO-PREV-001",

          notes:
            "Sample live-demo payment.",

          allocations: {
            create: {
              rentChargeId:
                previousCharges[3].id,

              amount:
                "4000.00",
            },
          },
        },
      });

      /**
       * ------------------------------------------------------
       * CURRENT MONTH RENT
       * ------------------------------------------------------
       *
       * Demo state:
       *
       * Juan   ₱4,000  PAID
       * Maria  ₱4,000  PAID
       * Carlo  ₱5,000  PARTIAL — paid ₱3,000
       * Anne   ₱4,000  OVERDUE
       *
       * Expected:    ₱17,000
       * Collected:   ₱11,000
       * Outstanding:  ₱6,000
       */

      const juanCharge =
        await tx.rentCharge.create({
          data: {
            leaseId:
              juanLease.id,

            periodYear:
              currentPeriod.year,

            periodMonth:
              currentPeriod.month,

            amount:
              "4000.00",

            dueDate:
              createDate(
                currentPeriod.year,
                currentPeriod.month,
                5,
              ),

            status:
              "PAID",
          },
        });

      const mariaCharge =
        await tx.rentCharge.create({
          data: {
            leaseId:
              mariaLease.id,

            periodYear:
              currentPeriod.year,

            periodMonth:
              currentPeriod.month,

            amount:
              "4000.00",

            dueDate:
              createDate(
                currentPeriod.year,
                currentPeriod.month,
                5,
              ),

            status:
              "PAID",
          },
        });

      const carloCharge =
        await tx.rentCharge.create({
          data: {
            leaseId:
              carloLease.id,

            periodYear:
              currentPeriod.year,

            periodMonth:
              currentPeriod.month,

            amount:
              "5000.00",

            dueDate:
              createDate(
                currentPeriod.year,
                currentPeriod.month,
                5,
              ),

            status:
              "PARTIALLY_PAID",
          },
        });

      await tx.rentCharge.create({
        data: {
          leaseId:
            anneLease.id,

          periodYear:
            currentPeriod.year,

          periodMonth:
            currentPeriod.month,

          amount:
            "4000.00",

          dueDate:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              5,
            ),

          status:
            "OVERDUE",
        },
      });

      /**
       * ------------------------------------------------------
       * CURRENT MONTH PAYMENTS
       * ------------------------------------------------------
       */

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            juan.id,

          amount:
            "4000.00",

          method:
            "GCASH",

          paidAt:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              3,
            ),

          referenceNumber:
            "GCASH-DEMO-001",

          notes:
            "Sample live-demo payment.",

          allocations: {
            create: {
              rentChargeId:
                juanCharge.id,

              amount:
                "4000.00",
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            maria.id,

          amount:
            "4000.00",

          method:
            "CASH",

          paidAt:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              5,
            ),

          notes:
            "Sample live-demo payment.",

          allocations: {
            create: {
              rentChargeId:
                mariaCharge.id,

              amount:
                "4000.00",
            },
          },
        },
      });

      await tx.payment.create({
        data: {
          landlordAccountId:
            landlord.id,

          tenantId:
            carlo.id,

          amount:
            "3000.00",

          method:
            "MAYA",

          paidAt:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              7,
            ),

          referenceNumber:
            "MAYA-DEMO-001",

          notes:
            "Partial rent payment for the live demo.",

          allocations: {
            create: {
              rentChargeId:
                carloCharge.id,

              amount:
                "3000.00",
            },
          },
        },
      });

      /**
       * ------------------------------------------------------
       * EXPENSES
       * ------------------------------------------------------
       */

      await tx.expense.create({
        data: {
          landlordAccountId:
            landlord.id,

          propertyId:
            property.id,

          category:
            "WATER",

          description:
            "Monthly water bill",

          amount:
            "1200.00",

          expenseDate:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              8,
            ),

          notes:
            "Sample live-demo expense.",
        },
      });

      await tx.expense.create({
        data: {
          landlordAccountId:
            landlord.id,

          propertyId:
            property.id,

          category:
            "REPAIR",

          description:
            "Bathroom faucet replacement",

          amount:
            "850.00",

          expenseDate:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              10,
            ),

          notes:
            "Sample live-demo expense.",
        },
      });

      await tx.expense.create({
        data: {
          landlordAccountId:
            landlord.id,

          propertyId:
            property.id,

          category:
            "INTERNET",

          description:
            "Monthly Wi-Fi bill",

          amount:
            "1500.00",

          expenseDate:
            createDate(
              currentPeriod.year,
              currentPeriod.month,
              12,
            ),

          notes:
            "Sample live-demo expense.",
        },
      });

      await tx.expense.create({
        data: {
          landlordAccountId:
            landlord.id,

          propertyId:
            property.id,

          category:
            "ELECTRICITY",

          description:
            "Previous month electricity bill",

          amount:
            "2350.00",

          expenseDate:
            createDate(
              previousPeriod.year,
              previousPeriod.month,
              11,
            ),

          notes:
            "Sample live-demo expense.",
        },
      });

      /**
       * ------------------------------------------------------
       * LOCK THE DEMO ACCOUNT — LAST STEP
       * ------------------------------------------------------
       *
       * This happens only after every sample record has been
       * created successfully.
       *
       * From this point forward the normal Abang application
       * will reject landlord mutations through:
       *
       *   requireWritableLandlord()
       */
      await tx.landlordAccount.update({
        where: {
          id:
            landlord.id,
        },

        data: {
          isDemo:
            true,
        },
      });
    },
  );

  console.log("");
  console.log(
    "✅ Abang PH live demo created!",
  );
  console.log("");

  console.log(
    "Property:",
  );

  console.log(
    "  Rusiana Boarding House",
  );

  console.log("");

  console.log(
    "Rentable spaces:",
  );

  console.log(
    "  5 total",
  );

  console.log(
    "  4 occupied",
  );

  console.log(
    "  1 available",
  );

  console.log("");

  console.log(
    "Current month:",
  );

  console.log(
    "  Expected:    ₱17,000",
  );

  console.log(
    "  Collected:   ₱11,000",
  );

  console.log(
    "  Outstanding:  ₱6,000",
  );

  console.log("");

  console.log(
    "Tenant states:",
  );

  console.log(
    "  Juan  — PAID",
  );

  console.log(
    "  Maria — PAID",
  );

  console.log(
    "  Carlo — PARTIALLY PAID",
  );

  console.log(
    "  Anne  — OVERDUE",
  );

  console.log("");

  console.log(
    "🔒 Demo landlord is now read-only.",
  );

  console.log(
    "👉 You can now test the View live demo button.",
  );

  console.log("");
}

main()
  .catch((error) => {
    console.error("");
    console.error(
      "❌ Demo seed failed.",
    );

    console.error(
      error instanceof Error
        ? error.message
        : error,
    );

    process.exitCode =
      1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });