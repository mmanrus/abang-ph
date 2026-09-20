import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import {
  prisma,
} from "@/lib/db/prisma";

import {
  requireLandlord,
} from "@/lib/auth/require-landlord";

import {
  EditPropertyForm,
} from "@/components/properties/edit-property-form";

type Props = {
  params: Promise<{
    propertyId: string;
  }>;
};

export default async function EditPropertyPage({
  params,
}: Props) {
  const {
    propertyId,
  } =
    await params;

  const {
    landlord,
  } =
    await requireLandlord();

  const property =
    await prisma.property.findFirst({
      where: {
        id:
          propertyId,

        landlordAccountId:
          landlord.id,

        deletedAt:
          null,
      },
    });

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        href={`/properties/${property.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600"
      >
        <ArrowLeft
          size={17}
        />

        {property.name}
      </Link>

      <h1 className="mt-5 text-2xl font-semibold text-zinc-950">
        Edit property
      </h1>

      <div className="mt-7">
        <EditPropertyForm
          property={
            property
          }
        />
      </div>
    </div>
  );
}