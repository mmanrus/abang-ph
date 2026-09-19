import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/require-user";
import { redirect } from "next/navigation";

export async function requireLandlord() {
  const user = await requireUser();

  const landlord = await prisma.landlordAccount.findUnique({
    where: {
      userId: user.id,
    },
  });

  if (!landlord) {
    redirect("/onboarding");
  }

  return {
    user,
    landlord,
  };
}