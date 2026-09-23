import CatalogueForm from "@/components/admin/CatalogueForm";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function AjouterModePaiementPage() {
  const dict = await getDictionary();
  const t = dict.adminModesPaiement;

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <AdminPageHeader title={t.titreAjout} />
      <CatalogueForm
        apiBase="/api/admin/modes-paiement"
        redirectListPath="/admin/modes-paiement/liste"
        label={t.champLabel}
      />
    </div>
  );
}
