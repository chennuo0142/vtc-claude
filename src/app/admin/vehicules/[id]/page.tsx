import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORIE_LABELS } from "@/lib/vehicule";
import DeleteVehiculeButton from "../liste/DeleteVehiculeButton";

export default async function VehiculeFichePage({
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
    <div className="mx-auto max-w-xl px-6 py-12">
      <Link href="/admin/vehicules/liste" className="mb-6 inline-block text-sm text-neutral-500 hover:underline">
        ← Retour à la liste
      </Link>

      <div className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="relative aspect-video w-full bg-neutral-100 dark:bg-neutral-800">
          {vehicule.photoUrl ? (
            <Image
              src={vehicule.photoUrl}
              alt={`${vehicule.marque} ${vehicule.modele}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-400">
              Pas de photo
            </div>
          )}
        </div>
        <div className="p-6">
          <h1 className="text-xl font-bold">
            {vehicule.marque} {vehicule.modele}
          </h1>
          <p className="mt-2 text-neutral-500">
            {CATEGORIE_LABELS[vehicule.categorie]} · {vehicule.nombrePlaces} places
          </p>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/admin/vehicules/${vehicule.id}/modifier`}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Modifier
            </Link>
            <DeleteVehiculeButton id={vehicule.id} redirectTo="/admin/vehicules/liste" />
          </div>
        </div>
      </div>
    </div>
  );
}
