import { getSettings } from "@/lib/settings";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { getDictionary } from "@/lib/i18n/dictionary";
import ReglagesForm from "./ReglagesForm";

export default async function ReglagesPage() {
  const settings = await getSettings();
  const dict = await getDictionary();
  const t = dict.adminReglages;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <AdminPageHeader title={t.titrePage} description={t.descriptionPage} />
      <ReglagesForm cardsPerPage={settings.cardsPerPage} />
    </div>
  );
}
