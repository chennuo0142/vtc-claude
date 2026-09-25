import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminDemandeRow from "./AdminDemandeRow";

export default async function AdminPage() {
  const dict = await getDictionary();
  const t = dict.adminDashboard;

  const demandes = await prisma.user.findMany({
    where: { status: "PENDING", emailVerifiedAt: { not: null } },
    include: { profile: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader
        title={t.titre}
        description={t.description}
      />

      {demandes.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.aucuneDemande}</p>
      ) : (
        <div className="flex flex-col">
          {demandes.map((demande, index) => (
            <AdminDemandeRow
              key={demande.id}
              id={demande.id}
              email={demande.email}
              nom={demande.profile?.nom ?? ""}
              prenom={demande.profile?.prenom ?? ""}
              telephone={demande.profile?.telephone ?? ""}
              ville={demande.profile?.ville ?? ""}
              codePostal={demande.profile?.codePostal ?? ""}
              last={index === demandes.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
