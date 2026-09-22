import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { CATEGORIE_LABELS } from "@/lib/vehicule";
import DeleteVehiculeButton from "./DeleteVehiculeButton";

export default async function ListeVehiculesPage() {
  const vehicules = await prisma.vehicule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">Véhicules enregistrés</h1>
        <Link
          href="/admin/vehicules"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Ajouter un véhicule
        </Link>
      </div>

      {vehicules.length === 0 ? (
        <p className="text-neutral-500">Aucun véhicule pour le moment.</p>
      ) : (
        <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {vehicules.map((vehicule) => (
            <div key={vehicule.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  {vehicule.photoUrl && (
                    <Image
                      src={vehicule.photoUrl}
                      alt={`${vehicule.marque} ${vehicule.modele}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    {vehicule.marque} {vehicule.modele}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {CATEGORIE_LABELS[vehicule.categorie]} · {vehicule.nombrePlaces} places
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/vehicules/${vehicule.id}`}
                  className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                >
                  Consulter
                </Link>
                <Link
                  href={`/admin/vehicules/${vehicule.id}/modifier`}
                  className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  Modifier
                </Link>
                <DeleteVehiculeButton id={vehicule.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
