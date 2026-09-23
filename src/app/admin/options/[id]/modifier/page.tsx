import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CatalogueForm from "@/components/admin/CatalogueForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function ModifierOptionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const option = await prisma.option.findUnique({ where: { id } });

  if (!option) notFound();

  const dict = await getDictionary();
  const t = dict.adminOptions;

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <AdminPageHeader title={t.titreModifier} />
      <CatalogueForm
        apiBase="/api/admin/options"
        redirectListPath="/admin/options/liste"
        label={t.champLabel}
        id={option.id}
        initialNom={option.nom}
      />
    </div>
  );
}
