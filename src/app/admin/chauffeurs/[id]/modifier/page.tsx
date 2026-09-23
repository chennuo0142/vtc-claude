import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ChauffeurForm from "../../ChauffeurForm";

export default async function ModifierChauffeurPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dict = await getDictionary();
  const t = dict.adminChauffeurs;

  const chauffeur = await prisma.user.findUnique({ where: { id }, include: { profile: true } });

  if (!chauffeur || !chauffeur.profile) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <Link
        href="/admin/chauffeurs/liste"
        className="mb-4 inline-block text-[13px] hover:text-[var(--color-accent)]"
        style={{ color: "var(--color-neutral-700)" }}
      >
        {t.modifierPage.retourListe}
      </Link>

      <AdminPageHeader title={t.modifierPage.titre} />

      <ChauffeurForm
        chauffeur={{
          id: chauffeur.id,
          email: chauffeur.email,
          nom: chauffeur.profile.nom,
          prenom: chauffeur.profile.prenom,
          telephone: chauffeur.profile.telephone,
          ville: chauffeur.profile.ville,
          codePostal: chauffeur.profile.codePostal,
        }}
      />
    </div>
  );
}
