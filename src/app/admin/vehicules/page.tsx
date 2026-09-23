import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import VehiculeForm from "./VehiculeForm";

export default async function AdminVehiculesPage() {
  const dict = await getDictionary();
  const t = dict.adminVehicules;

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <AdminPageHeader title={t.ajouter.titre} />
      <VehiculeForm />
    </div>
  );
}
