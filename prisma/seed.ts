import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined.");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter,
});

function currentBillingPeriod() {
    const now = new Date();

    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
    };
}

function createDueDate(
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

async function clearDatabase() {
    console.log("Cleaning existing development data...");

    // Delete children before parents because the schema uses
    // Restrict for important relationships.

    await prisma.paymentAllocation.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.rentCharge.deleteMany();

    await prisma.expense.deleteMany();

    await prisma.lease.deleteMany();
    await prisma.tenant.deleteMany();

    await prisma.rentableSpace.deleteMany();
    await prisma.unit.deleteMany();
    await prisma.property.deleteMany();

    await prisma.landlordAccount.deleteMany();
    await prisma.user.deleteMany();
}

async function main() {
    console.log("Starting Abang PH seed...");

    await clearDatabase();

    const period = currentBillingPeriod();

    // ==========================================================
    // LANDLORD
    // ==========================================================

    const user = await prisma.user.create({
        data: {
            name: "Emmanuel Rusiana",
            email: "demo@abang.ph",
            emailVerified: true,
            phone: "09171234567",
        },
    });

    const landlord = await prisma.landlordAccount.create({
        data: {
            userId: user.id,
            displayName: "Rusiana Rentals",
            phone: "09171234567",
            timezone: "Asia/Manila",
            currency: "PHP",
        },
    });

    // ==========================================================
    // PROPERTY
    // ==========================================================

    const property = await prisma.property.create({
        data: {
            landlordAccountId: landlord.id,
            name: "Rusiana Boarding House",
            type: "BOARDING_HOUSE",

            addressLine1: "Sample Street",
            barangay: "Lahug",
            city: "Cebu City",
            province: "Cebu",

            description:
                "Development property used for testing Abang PH.",
        },
    });

    // ==========================================================
    // ROOM 101
    // ==========================================================

    const room101 = await prisma.unit.create({
        data: {
            propertyId: property.id,
            name: "Room 101",
            floor: "1",
        },
    });

    const room101BedA =
        await prisma.rentableSpace.create({
            data: {
                unitId: room101.id,
                name: "Bed A",
                defaultRent: "4000.00",
                status: "OCCUPIED",
            },
        });

    const room101BedB =
        await prisma.rentableSpace.create({
            data: {
                unitId: room101.id,
                name: "Bed B",
                defaultRent: "4000.00",
                status: "OCCUPIED",
            },
        });

    await prisma.rentableSpace.create({
        data: {
            unitId: room101.id,
            name: "Bed C",
            defaultRent: "4000.00",
            status: "AVAILABLE",
        },
    });

    // ==========================================================
    // ROOM 102
    // ==========================================================

    const room102 = await prisma.unit.create({
        data: {
            propertyId: property.id,
            name: "Room 102",
            floor: "1",
        },
    });

    const room102BedA =
        await prisma.rentableSpace.create({
            data: {
                unitId: room102.id,
                name: "Bed A",
                defaultRent: "5000.00",
                status: "OCCUPIED",
            },
        });

    const room102BedB =
        await prisma.rentableSpace.create({
            data: {
                unitId: room102.id,
                name: "Bed B",
                defaultRent: "4000.00",
                status: "OCCUPIED",
            },
        });

    // ==========================================================
    // TENANTS
    // ==========================================================

    const juan = await prisma.tenant.create({
        data: {
            landlordAccountId: landlord.id,
            fullName: "Juan Dela Cruz",
            phone: "09170000001",
            email: "juan@example.com",

            emergencyContactName: "Ana Dela Cruz",
            emergencyContactPhone: "09171111111",
        },
    });

    const maria = await prisma.tenant.create({
        data: {
            landlordAccountId: landlord.id,
            fullName: "Maria Santos",
            phone: "09170000002",
            email: "maria@example.com",
        },
    });

    const carlo = await prisma.tenant.create({
        data: {
            landlordAccountId: landlord.id,
            fullName: "Carlo Reyes",
            phone: "09170000003",
        },
    });

    const anne = await prisma.tenant.create({
        data: {
            landlordAccountId: landlord.id,
            fullName: "Anne Garcia",
            phone: "09170000004",
        },
    });

    // ==========================================================
    // LEASES
    // ==========================================================

    const leaseStart = new Date(
        Date.UTC(
            period.year,
            period.month - 2,
            1,
        ),
    );

    const juanLease = await prisma.lease.create({
        data: {
            tenantId: juan.id,
            rentableSpaceId: room101BedA.id,

            startDate: leaseStart,

            monthlyRent: "4000.00",
            dueDay: 5,
            securityDeposit: "4000.00",

            status: "ACTIVE",
        },
    });

    const mariaLease = await prisma.lease.create({
        data: {
            tenantId: maria.id,
            rentableSpaceId: room101BedB.id,

            startDate: leaseStart,

            monthlyRent: "4000.00",
            dueDay: 5,
            securityDeposit: "4000.00",

            status: "ACTIVE",
        },
    });

    const carloLease = await prisma.lease.create({
        data: {
            tenantId: carlo.id,
            rentableSpaceId: room102BedA.id,

            startDate: leaseStart,

            monthlyRent: "5000.00",
            dueDay: 5,
            securityDeposit: "5000.00",

            status: "ACTIVE",
        },
    });

    const anneLease = await prisma.lease.create({
        data: {
            tenantId: anne.id,
            rentableSpaceId: room102BedB.id,

            startDate: leaseStart,

            monthlyRent: "4000.00",
            dueDay: 5,
            securityDeposit: "4000.00",

            status: "ACTIVE",
        },
    });

    // ==========================================================
    // CURRENT MONTH RENT CHARGES
    // ==========================================================

    const juanCharge = await prisma.rentCharge.create({
        data: {
            leaseId: juanLease.id,

            periodYear: period.year,
            periodMonth: period.month,

            amount: "4000.00",

            dueDate: createDueDate(
                period.year,
                period.month,
                5,
            ),

            status: "PAID",
        },
    });

    const mariaCharge = await prisma.rentCharge.create({
        data: {
            leaseId: mariaLease.id,

            periodYear: period.year,
            periodMonth: period.month,

            amount: "4000.00",

            dueDate: createDueDate(
                period.year,
                period.month,
                5,
            ),

            status: "PAID",
        },
    });

    const carloCharge = await prisma.rentCharge.create({
        data: {
            leaseId: carloLease.id,

            periodYear: period.year,
            periodMonth: period.month,

            amount: "5000.00",

            dueDate: createDueDate(
                period.year,
                period.month,
                5,
            ),

            status: "PARTIALLY_PAID",
        },
    });

    await prisma.rentCharge.create({
        data: {
            leaseId: anneLease.id,

            periodYear: period.year,
            periodMonth: period.month,

            amount: "4000.00",

            dueDate: createDueDate(
                period.year,
                period.month,
                5,
            ),

            status: "OVERDUE",
        },
    });

    // ==========================================================
    // PAYMENTS
    // ==========================================================

    const juanPayment = await prisma.payment.create({
        data: {
            landlordAccountId: landlord.id,
            tenantId: juan.id,

            amount: "4000.00",

            method: "GCASH",

            paidAt: createDueDate(
                period.year,
                period.month,
                3,
            ),

            referenceNumber: "GCASH-DEMO-001",

            allocations: {
                create: {
                    rentChargeId: juanCharge.id,
                    amount: "4000.00",
                },
            },
        },
    });

    const mariaPayment = await prisma.payment.create({
        data: {
            landlordAccountId: landlord.id,
            tenantId: maria.id,

            amount: "4000.00",

            method: "CASH",

            paidAt: createDueDate(
                period.year,
                period.month,
                5,
            ),

            allocations: {
                create: {
                    rentChargeId: mariaCharge.id,
                    amount: "4000.00",
                },
            },
        },
    });

    const carloPayment = await prisma.payment.create({
        data: {
            landlordAccountId: landlord.id,
            tenantId: carlo.id,

            amount: "3000.00",

            method: "MAYA",

            paidAt: createDueDate(
                period.year,
                period.month,
                7,
            ),

            referenceNumber: "MAYA-DEMO-001",

            allocations: {
                create: {
                    rentChargeId: carloCharge.id,
                    amount: "3000.00",
                },
            },
        },
    });

    // Prevent TypeScript from considering these unused in case
    // strict project settings change later.

    void juanPayment;
    void mariaPayment;
    void carloPayment;

    // ==========================================================
    // EXPENSES
    // ==========================================================

    await prisma.expense.create({
        data: {
            landlordAccountId: landlord.id,
            propertyId: property.id,

            category: "WATER",

            description: "Monthly water bill",

            amount: "1200.00",

            expenseDate: createDueDate(
                period.year,
                period.month,
                8,
            ),
        },
    });

    await prisma.expense.create({
        data: {
            landlordAccountId: landlord.id,
            propertyId: property.id,

            category: "REPAIR",

            description: "Bathroom faucet replacement",

            amount: "850.00",

            expenseDate: createDueDate(
                period.year,
                period.month,
                10,
            ),
        },
    });

    // ==========================================================
    // SUMMARY
    // ==========================================================

    console.log("");
    console.log("✅ Abang PH seed completed.");
    console.log("");
    console.log("Property:");
    console.log("  Rusiana Boarding House");
    console.log("");
    console.log("Rentable spaces:");
    console.log("  5 total");
    console.log("  4 occupied");
    console.log("  1 vacant");
    console.log("");
    console.log("Current month:");
    console.log("  Expected rent: ₱17,000");
    console.log("  Collected:     ₱11,000");
    console.log("  Outstanding:   ₱6,000");
    console.log("");
    console.log("Tenant states:");
    console.log("  Juan  - PAID");
    console.log("  Maria - PAID");
    console.log("  Carlo - PARTIALLY PAID");
    console.log("  Anne  - OVERDUE");
    console.log("");
    console.log("Demo user:");
    console.log("  demo@abang.ph");
}

main()
    .catch((error) => {
        console.error("❌ Seed failed.");
        console.error(error);

        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });