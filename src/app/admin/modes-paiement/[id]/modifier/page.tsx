import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogueForm from "@/components/admin/CatalogueForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ModifierModePaiementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const modePaiement = await prisma.modePaiement.findUnique({ where: { id } });

  if (!modePaiement) notFound();

  const dict = await getDictionary();
  const t = dict.adminModesPaiement;

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <AdminPageHeader title={t.titreModifier} />
      <CatalogueForm
        apiBase="/api/admin/modes-paiement"
        redirectListPath="/admin/modes-paiement/liste"
        label={t.champLabel}
        id={modePaiement.id}
        initialNom={modePaiement.nom}
      />
    </div>
  );
}
