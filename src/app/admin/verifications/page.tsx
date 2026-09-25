import { prisma } from "@/lib/prisma";
import { getDictionary, getLocale } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminRow from "@/components/admin/AdminRow";
import InitialsAvatar from "@/components/admin/InitialsAvatar";
import DeleteVerificationButton from "./DeleteVerificationButton";

export default async function AdminVerificationsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.adminVerifications;

  const demandes = await prisma.user.findMany({
    where: { role: "USER", status: "PENDING", emailVerifiedAt: null },
    include: {
      profile: true,
      emailVerificationTokens: {
        where: { usedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader title={t.titre} description={t.description} />

      {demandes.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.aucuneDemande}</p>
      ) : (
        <div className="flex flex-col">
          {demandes.map((demande, index) => {
            const { profile } = demande;
            const linkValid = demande.emailVerificationTokens.length > 0;
            return (
              <AdminRow
                key={demande.id}
                last={index === demandes.length - 1}
                leading={<InitialsAvatar initials={`${profile?.prenom[0] ?? ""}${profile?.nom[0] ?? ""}`} />}
                title={`${profile?.prenom ?? ""} ${profile?.nom ?? ""}`}
                subtitle={demande.email}
                meta={
                  <>
                    {profile ? `${profile.telephone} · ${profile.ville} ${profile.codePostal}` : null}
                    <br />
                    {t.inscritLe} {dateFormat.format(demande.createdAt)} · {linkValid ? t.lienValide : t.lienExpire}
                  </>
                }
                actions={<DeleteVerificationButton id={demande.id} />}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
