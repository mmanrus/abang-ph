import "server-only";

import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/errors";

/**
 * TenantService
 * -------------
 *
 * A Tenant can stop being active without deleting
 * their historical information.
 *
 * Example:
 *
 * Juan moved out.
 *
 * We still need:
 *
 * Juan
 * ├── old Lease
 * ├── old RentCharges
 * └── old Payments
 *
 * Therefore:
 *
 * isActive = false
 *
 * instead of deleting Juan.
 */

export async function updateTenant({
  landlordAccountId,
  tenantId,
  fullName,
  phone,
  email,
  emergencyContactName,
  emergencyContactPhone,
  notes,
}: {
  landlordAccountId: string;
  tenantId: string;

  fullName: string;

  phone?: string | null;
  email?: string | null;

  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;

  notes?: string | null;
}) {
  const name =
    fullName.trim();

  if (!name) {
    throw new AppError(
      "Tenant name is required.",
    );
  }

  const result =
    await prisma.tenant.updateMany({
      where: {
        id:
          tenantId,

        landlordAccountId,

        deletedAt:
          null,
      },

      data: {
        fullName:
          name,

        phone:
          phone?.trim() ||
          null,

        email:
          email?.trim() ||
          null,

        emergencyContactName:
          emergencyContactName?.trim() ||
          null,

        emergencyContactPhone:
          emergencyContactPhone?.trim() ||
          null,

        notes:
          notes?.trim() ||
          null,
      },
    });

  if (
    result.count !== 1
  ) {
    throw new AppError(
      "Tenant not found.",
    );
  }
}

export async function deactivateTenant({
  landlordAccountId,
  tenantId,
}: {
  landlordAccountId: string;
  tenantId: string;
}) {
  const tenant =
    await prisma.tenant.findFirst({
      where: {
        id:
          tenantId,

        landlordAccountId,

        deletedAt:
          null,

        isActive:
          true,
      },

      select: {
        id: true,
      },
    });

  if (!tenant) {
    throw new AppError(
      "Active tenant not found.",
    );
  }

  /**
   * We refuse to deactivate someone who still occupies
   * a rental space.
   *
   * Correct lifecycle:
   *
   * End lease
   *    ↓
   * space becomes AVAILABLE
   *    ↓
   * deactivate tenant
   */
  const activeLease =
    await prisma.lease.findFirst({
      where: {
        tenantId,

        status:
          "ACTIVE",

        deletedAt:
          null,
      },

      select: {
        id: true,
      },
    });

  if (activeLease) {
    throw new AppError(
      "This tenant still has an active lease. End the lease before deactivating the tenant.",
    );
  }

  await prisma.tenant.update({
    where: {
      id:
        tenant.id,
    },

    data: {
      isActive:
        false,
    },
  });
}