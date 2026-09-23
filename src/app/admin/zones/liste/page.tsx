import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminRow from "@/components/admin/AdminRow";
import DeleteCatalogueButton from "@/components/admin/DeleteCatalogueButton";
import { getDictionary } from "@/lib/i18n/dictionary";

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

export default async function ListeZonesPage() {
  const zones = await prisma.zone.findMany({ orderBy: { createdAt: "desc" } });
  const dict = await getDictionary();
  const t = dict.adminZones;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader
        title={t.titreListe}
        description={t.descriptionListe}
        action={
          <Link href="/admin/zones" className="btn btn-primary blueprint relative">
            <Corners />
            {t.boutonAjouterListe}
          </Link>
        }
      />

      {zones.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.videMessage}</p>
      ) : (
        <div className="flex flex-col">
          {zones.map((zone, index) => (
            <AdminRow
              key={zone.id}
              last={index === zones.length - 1}
              title={zone.nom}
              actions={
                <>
                  <Link href={`/admin/zones/${zone.id}/modifier`} className="btn btn-secondary btn-sm">
                    {dict.common.modifier}
                  </Link>
                  <DeleteCatalogueButton
                    apiPath={`/api/admin/zones/${zone.id}`}
                    confirmMessage={t.confirmSuppression}
                  />
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
