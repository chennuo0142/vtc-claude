import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import VehiculeForm from "../../VehiculeForm";

export default async function ModifierVehiculePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dict = await getDictionary();
  const t = dict.adminVehicules;

  const vehicule = await prisma.vehicule.findUnique({ where: { id } });

  if (!vehicule) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <Link
        href={`/admin/vehicules/${vehicule.id}`}
        className="mb-4 inline-block text-[13px] hover:text-[var(--color-accent)]"
        style={{ color: "var(--color-neutral-700)" }}
      >
        {t.modifierPage.retourFiche}
      </Link>

      <AdminPageHeader title={t.modifierPage.titre} />

      <VehiculeForm vehicule={vehicule} />
    </div>
  );
}
