import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminRow from "@/components/admin/AdminRow";
import DeleteVehiculeButton from "./DeleteVehiculeButton";

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

export default async function ListeVehiculesPage() {
  const dict = await getDictionary();
  const t = dict.adminVehicules;

  const vehicules = await prisma.vehicule.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader
        title={t.liste.titre}
        description={t.liste.description}
        action={
          <Link href="/admin/vehicules" className="btn btn-primary blueprint relative">
            <Corners />
            {t.liste.ajouterVehicule}
          </Link>
        }
      />

      {vehicules.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.liste.aucunVehicule}</p>
      ) : (
        <div className="flex flex-col">
          {vehicules.map((vehicule, index) => (
            <AdminRow
              key={vehicule.id}
              last={index === vehicules.length - 1}
              leading={
                <div className="blueprint relative h-14 w-14 flex-shrink-0 overflow-hidden">
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
              }
              title={`${vehicule.marque} ${vehicule.modele}`}
              subtitle={`${dict.common.categories[vehicule.categorie]} · ${t.liste.places(vehicule.nombrePlaces)}`}
              actions={
                <>
                  <Link href={`/admin/vehicules/${vehicule.id}`} className="btn btn-secondary btn-sm">
                    {t.liste.consulter}
                  </Link>
                  <Link href={`/admin/vehicules/${vehicule.id}/modifier`} className="btn btn-secondary btn-sm">
                    {t.liste.modifier}
                  </Link>
                  <DeleteVehiculeButton id={vehicule.id} />
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
