import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminRow from "@/components/admin/AdminRow";
import InitialsAvatar from "@/components/admin/InitialsAvatar";
import { PencilIcon } from "@/components/icons";

export default async function AdminModificationsPage() {
  const dict = await getDictionary();
  const t = dict.adminModifications;

  const profils = await prisma.profile.findMany({
    where: { hasPendingChanges: true },
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader
        title={t.titre}
        description={t.description}
      />

      {profils.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.aucuneModification}</p>
      ) : (
        <div className="flex flex-col">
          {profils.map((profil, index) => (
            <AdminRow
              key={profil.id}
              last={index === profils.length - 1}
              leading={<InitialsAvatar initials={`${profil.prenom[0] ?? ""}${profil.nom[0] ?? ""}`} />}
              title={`${profil.prenom} ${profil.nom}`}
              subtitle={profil.user.email}
              actions={
                <Link href={`/admin/modifications/${profil.id}`} className="btn btn-secondary btn-sm">
                  <PencilIcon style={{ width: 14, height: 14 }} />
                  {t.examiner}
                </Link>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
