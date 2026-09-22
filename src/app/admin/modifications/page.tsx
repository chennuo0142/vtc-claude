import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminModificationsPage() {
  const profils = await prisma.profile.findMany({
    where: { hasPendingChanges: true },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Modifications de profil en attente</h1>
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          ← Retour aux demandes
        </Link>
      </div>

      {profils.length === 0 ? (
        <p className="text-neutral-500">Aucune modification en attente.</p>
      ) : (
        <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {profils.map((profil) => (
            <div key={profil.id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="font-medium">
                  {profil.prenom} {profil.nom}
                </p>
                <p className="text-sm text-neutral-500">{profil.user.email}</p>
              </div>
              <Link
                href={`/admin/modifications/${profil.id}`}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                Examiner
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
