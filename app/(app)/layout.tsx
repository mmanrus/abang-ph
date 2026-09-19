import { AppNavigation } from "@/components/app/app-navigation";
import { requireLandlord } from "@/lib/auth/require-landlord";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, landlord } =
    await requireLandlord();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNavigation
        userName={user.name}
        landlordName={landlord.displayName}
      />

      <main className="pb-24 lg:ml-64 lg:pb-0">
        {children}
      </main>
    </div>
  );
}