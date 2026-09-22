import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VehiculeForm from "../../VehiculeForm";

export default async function ModifierVehiculePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vehicule = await prisma.vehicule.findUnique({ where: { id } });

  if (!vehicule) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <Link
        href={`/admin/vehicules/${vehicule.id}`}
        className="mb-6 inline-block text-sm text-neutral-500 hover:underline"
      >
        ← Retour à la fiche
      </Link>

      <h1 className="mb-6 text-xl font-bold">Modifier le véhicule</h1>

      <VehiculeForm vehicule={vehicule} />
    </div>
  );
}
