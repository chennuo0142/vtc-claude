import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminDemandeRow from "./AdminDemandeRow";

export default async function AdminPage() {
  const demandes = await prisma.user.findMany({
    where: { status: "PENDING" },
    include: { profile: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold">Demandes d&apos;inscription en attente</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/modifications"
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            Modifications à valider
          </Link>
          <Link
            href="/admin/vehicules/liste"
            className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
          >
            Gérer les véhicules
          </Link>
          <Link
            href="/admin/reglages"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            Réglages
          </Link>
        </div>
      </div>

      {demandes.length === 0 ? (
        <p className="text-neutral-500">Aucune demande en attente.</p>
      ) : (
        <div className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {demandes.map((demande) => (
            <AdminDemandeRow
              key={demande.id}
              id={demande.id}
              email={demande.email}
              nom={demande.profile?.nom ?? ""}
              prenom={demande.profile?.prenom ?? ""}
              telephone={demande.profile?.telephone ?? ""}
              ville={demande.profile?.ville ?? ""}
              codePostal={demande.profile?.codePostal ?? ""}
            />
          ))}
        </div>
      )}
    </div>
  );
}
