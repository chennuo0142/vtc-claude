import Link from "next/link";
import VehiculeForm from "./VehiculeForm";

export default function AdminVehiculesPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">Ajouter un véhicule</h1>
        <Link href="/admin/vehicules/liste" className="text-sm text-neutral-500 hover:underline">
          Voir la liste →
        </Link>
      </div>

      <VehiculeForm />
    </div>
  );
}
