import { requireLandlord } from "@/lib/auth/require-landlord";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const { user, landlord } =
    await requireLandlord();

  const [propertyCount, tenantCount] =
    await Promise.all([
      prisma.property.count({
        where: {
          landlordAccountId: landlord.id,
          deletedAt: null,
        },
      }),

      prisma.tenant.count({
        where: {
          landlordAccountId: landlord.id,
          deletedAt: null,
        },
      }),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div>
        <p className="text-sm text-zinc-500">
          Welcome back
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
          {user.name}
        </h1>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <DashboardCard
          label="Properties"
          value={String(propertyCount)}
        />

        <DashboardCard
          label="Tenants"
          value={String(tenantCount)}
        />

        <DashboardCard
          label="Currency"
          value={landlord.currency}
        />

        <DashboardCard
          label="Timezone"
          value={landlord.timezone}
        />
      </div>
    </div>
  );
}

function DashboardCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-medium text-zinc-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-tight text-zinc-950 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}