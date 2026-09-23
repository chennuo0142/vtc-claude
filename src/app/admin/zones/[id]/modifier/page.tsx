import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogueForm from "@/components/admin/CatalogueForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ModifierZonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const zone = await prisma.zone.findUnique({ where: { id } });

  if (!zone) notFound();

  const dict = await getDictionary();
  const t = dict.adminZones;

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <AdminPageHeader title={t.titreModifier} />
      <CatalogueForm
        apiBase="/api/admin/zones"
        redirectListPath="/admin/zones/liste"
        label={t.champLabel}
        id={zone.id}
        initialNom={zone.nom}
      />
    </div>
  );
}
