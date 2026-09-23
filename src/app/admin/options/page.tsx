import CatalogueForm from "@/components/admin/CatalogueForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function AjouterOptionPage() {
  const dict = await getDictionary();
  const t = dict.adminOptions;

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <AdminPageHeader title={t.titreAjout} />
      <CatalogueForm apiBase="/api/admin/options" redirectListPath="/admin/options/liste" label={t.champLabel} />
    </div>
  );
}
