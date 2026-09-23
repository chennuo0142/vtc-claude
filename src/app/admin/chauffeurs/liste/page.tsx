import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminRow from "@/components/admin/AdminRow";
import InitialsAvatar from "@/components/admin/InitialsAvatar";
import ChauffeurActions from "./ChauffeurActions";

export default async function ListeChauffeursPage() {
  const dict = await getDictionary();
  const t = dict.adminChauffeurs;

  const chauffeurs = await prisma.user.findMany({
    where: { role: "USER", status: "APPROVED", profile: { isNot: null } },
    include: { profile: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader title={t.liste.titre} description={t.liste.description} />

      {chauffeurs.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.liste.aucunChauffeur}</p>
      ) : (
        <div className="flex flex-col">
          {chauffeurs.map((chauffeur, index) => {
            const profile = chauffeur.profile!;
            return (
              <AdminRow
                key={chauffeur.id}
                last={index === chauffeurs.length - 1}
                leading={<InitialsAvatar initials={`${profile.prenom[0] ?? ""}${profile.nom[0] ?? ""}`} />}
                title={`${profile.prenom} ${profile.nom}`}
                subtitle={chauffeur.email}
                meta={
                  <>
                    {profile.ville} · {profile.telephone}
                    {chauffeur.suspended && (
                      <span
                        className="tag"
                        style={{ marginLeft: 8, background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
                      >
                        {t.liste.suspendu}
                      </span>
                    )}
                  </>
                }
                actions={<ChauffeurActions id={chauffeur.id} suspended={chauffeur.suspended} />}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
