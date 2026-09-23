import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import DeleteVehiculeButton from "../liste/DeleteVehiculeButton";

function Corners() {
  return (
    <>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
    </>
  );
}

export default async function VehiculeFichePage({
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
    <div className="mx-auto max-w-xl px-6 py-12">
      <AdminPageHeader
        title={`${vehicule.marque} ${vehicule.modele}`}
        description={`${dict.common.categories[vehicule.categorie]} · ${t.liste.places(vehicule.nombrePlaces)}`}
      />

      <div className="blueprint relative overflow-hidden" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <div className="blueprint relative aspect-video w-full overflow-hidden">
          <Corners />
          {vehicule.photoUrl ? (
            <Image
              src={vehicule.photoUrl}
              alt={`${vehicule.marque} ${vehicule.modele}`}
              fill
              className="object-cover"
            />
          ) : (
            <div className="hatch h-full w-full" />
          )}
        </div>
        <div className="p-6">
          <div className="flex gap-3">
            <Link
              href={`/admin/vehicules/${vehicule.id}/modifier`}
              className="btn btn-primary blueprint relative"
            >
              <Corners />
              {t.detail.modifier}
            </Link>
            <DeleteVehiculeButton id={vehicule.id} redirectTo="/admin/vehicules/liste" variant="text" />
          </div>
        </div>
      </div>
    </div>
  );
}
