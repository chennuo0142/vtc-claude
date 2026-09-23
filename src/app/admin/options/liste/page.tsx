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

export default async function ListeOptionsPage() {
  const options = await prisma.option.findMany({ orderBy: { createdAt: "desc" } });
  const dict = await getDictionary();
  const t = dict.adminOptions;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <AdminPageHeader
        title={t.titreListe}
        description={t.descriptionListe}
        action={
          <Link href="/admin/options" className="btn btn-primary blueprint relative">
            <Corners />
            {t.boutonAjouterListe}
          </Link>
        }
      />

      {options.length === 0 ? (
        <p style={{ color: "var(--color-neutral-700)" }}>{t.videMessage}</p>
      ) : (
        <div className="flex flex-col">
          {options.map((option, index) => (
            <AdminRow
              key={option.id}
              last={index === options.length - 1}
              title={option.nom}
              actions={
                <>
                  <Link href={`/admin/options/${option.id}/modifier`} className="btn btn-secondary btn-sm">
                    {dict.common.modifier}
                  </Link>
                  <DeleteCatalogueButton
                    apiPath={`/api/admin/options/${option.id}`}
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
