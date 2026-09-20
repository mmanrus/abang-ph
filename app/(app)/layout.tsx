import {
  AppNavigation,
} from "@/components/app/app-navigation";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

export default async function AppLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  /**
   * AUTHENTICATION AT THE LAYOUT
   * ----------------------------
   *
   * Every page under:
   *
   * app/(app)/*
   *
   * automatically passes through this check.
   *
   * That means we don't rely on the navigation UI
   * itself for protection.
   *
   * Navigation visibility = UX
   * requireLandlord()     = security
   */
  const {
    user,
    landlord,
  } =
    await requireLandlord();

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppNavigation
        userName={
          user.name
        }
        landlordName={
          landlord.displayName
        }
      />

      <main className="min-h-screen pb-24 lg:ml-64 lg:pb-0">
        {children}
      </main>
    </div>
  );
}