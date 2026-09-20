import Link from "next/link";

import {
  ArrowLeft,
} from "lucide-react";

import {
  notFound,
} from "next/navigation";

import {
  EditTenantForm,
} from "@/components/tenants/edit-tenant-form";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  prisma,
} from "@/lib/db/prisma";

type Props = {
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function EditTenantPage({
  params,
}: Props) {
  const {
    tenantId,
  } =
    await params;

  const {
    landlord,
  } =
    await requireLandlord();

  /**
   * SECURITY / DATA ISOLATION
   * -------------------------
   *
   * tenantId comes from the URL:
   *
   * /tenants/abc123/edit
   *
   * URLs are controlled by the browser/user.
   *
   * Therefore:
   *
   *   id: tenantId
   *
   * is NOT enough.
   *
   * We also require:
   *
   *   landlordAccountId: landlord.id
   *
   * so another landlord cannot manually type someone else's
   * tenant ID and access their information.
   */
  const tenant =
    await prisma.tenant.findFirst({
      where: {
        id:
          tenantId,

        landlordAccountId:
          landlord.id,

        deletedAt:
          null,
      },

      select: {
        id: true,

        fullName: true,

        phone: true,
        email: true,

        emergencyContactName:
          true,

        emergencyContactPhone:
          true,

        notes: true,

        isActive: true,
      },
    });

  if (!tenant) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href={`/tenants/${tenant.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition hover:text-zinc-950"
      >
        <ArrowLeft
          size={17}
        />

        {tenant.fullName}
      </Link>

      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Edit tenant
          </h1>

          <span
            className={[
              "rounded-full px-2.5 py-1 text-xs font-medium",
              tenant.isActive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-zinc-100 text-zinc-600",
            ].join(" ")}
          >
            {tenant.isActive
              ? "ACTIVE"
              : "INACTIVE"}
          </span>
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          Update contact information and tenant details.
        </p>
      </div>

      <div className="mt-7">
        <EditTenantForm
          tenant={
            tenant
          }
        />
      </div>
    </div>
  );
}