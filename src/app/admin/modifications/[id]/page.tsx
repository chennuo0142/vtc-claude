import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLangues, formatLangue } from "@/lib/langues";
import { getDictionary } from "@/lib/i18n/dictionary";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import ModificationActions from "./ModificationActions";

function formatLanguesList(value: unknown): string {
  const entries = parseLangues(value);
  if (entries.length === 0) return "";
  return entries
    .map((entry) => {
      const { drapeau, libelle } = formatLangue(entry);
      return `${drapeau} ${libelle} ${"★".repeat(entry.niveau)}${"☆".repeat(3 - entry.niveau)}`;
    })
    .join(", ");
}

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

function Champ({
  label,
  avant,
  apres,
  proposeLabel,
  videMarqueur,
  last = false,
}: {
  label: string;
  avant: string;
  apres: string;
  proposeLabel: string;
  videMarqueur: string;
  last?: boolean;
}) {
  const change = avant !== apres;
  return (
    <div
      className="grid grid-cols-2 gap-4 py-3"
      style={{ borderBottom: last ? "none" : "1px solid var(--color-divider)" }}
    >
      <div>
        <p className="text-[11px] font-medium uppercase" style={{ color: "var(--color-neutral-700)" }}>
          {label}
        </p>
        <p className="text-sm">{avant || videMarqueur}</p>
      </div>
      <div>
        <p className="text-[11px] font-medium uppercase" style={{ color: "var(--color-neutral-700)" }}>
          {proposeLabel}
        </p>
        <p className={`text-sm ${change ? "diff-changed" : ""}`} style={change ? undefined : { color: "var(--color-neutral-700)" }}>
          {apres || videMarqueur}
        </p>
      </div>
    </div>
  );
}

function Galerie({ urls, label, aucunePhoto }: { urls: string[]; label: string; aucunePhoto: string }) {
  const photos = urls.filter(Boolean);
  return (
    <div>
      <p className="mb-2 text-[11px] font-medium uppercase" style={{ color: "var(--color-neutral-700)" }}>
        {label}
      </p>
      {photos.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
          {aucunePhoto}
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url) => (
            <div key={url} className="blueprint relative aspect-square overflow-hidden">
              <Corners />
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhotoCompare({
  label,
  url,
  aspect = "square",
}: {
  label: string;
  url: string | null;
  aspect?: "square" | "video";
}) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase" style={{ color: "var(--color-neutral-700)" }}>
        {label}
      </p>
      <div
        className={`blueprint relative mt-1 overflow-hidden ${aspect === "square" ? "h-24 w-24" : "aspect-video w-full"}`}
      >
        <Corners />
        {url ? <Image src={url} alt="" fill className="object-cover" /> : <div className="hatch h-full w-full" />}
      </div>
    </div>
  );
}

export default async function ModificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const dict = await getDictionary();
  const t = dict.adminModificationDetail;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      user: true,
      vehicule: true,
      pendingVehicule: true,
      zones: true,
      pendingZones: true,
      options: true,
      pendingOptions: true,
      modesPaiement: true,
      pendingModesPaiement: true,
    },
  });

  if (!profile || !profile.hasPendingChanges) {
    notFound();
  }

  const champs = [
    { label: t.champs.nom, avant: profile.nom, apres: profile.pendingNom ?? "" },
    { label: t.champs.prenom, avant: profile.prenom, apres: profile.pendingPrenom ?? "" },
    { label: t.champs.bio, avant: profile.bio ?? "", apres: profile.pendingBio ?? "" },
    { label: t.champs.telephone, avant: profile.telephone, apres: profile.pendingTelephone ?? "" },
    { label: t.champs.ville, avant: profile.ville, apres: profile.pendingVille ?? "" },
    { label: t.champs.codePostal, avant: profile.codePostal, apres: profile.pendingCodePostal ?? "" },
    { label: t.champs.emailContact, avant: profile.emailContact ?? "", apres: profile.pendingEmailContact ?? "" },
    {
      label: t.champs.languesParlees,
      avant: formatLanguesList(profile.langues),
      apres: formatLanguesList(profile.pendingLangues),
    },
    {
      label: t.champs.vehicule,
      avant: profile.vehicule ? `${profile.vehicule.marque} ${profile.vehicule.modele}` : "",
      apres: profile.pendingVehicule ? `${profile.pendingVehicule.marque} ${profile.pendingVehicule.modele}` : "",
    },
    {
      label: t.champs.nombrePlaces,
      avant: profile.nombrePlaces?.toString() ?? "",
      apres: profile.pendingNombrePlaces?.toString() ?? "",
    },
    { label: t.champs.anneeVehicule, avant: profile.annee?.toString() ?? "", apres: profile.pendingAnnee?.toString() ?? "" },
    {
      label: t.champs.zonesTravail,
      avant: profile.zones.map((z) => z.nom).join(", "),
      apres: profile.pendingZones.map((z) => z.nom).join(", "),
    },
    {
      label: t.champs.options,
      avant: profile.options.map((o) => o.nom).join(", "),
      apres: profile.pendingOptions.map((o) => o.nom).join(", "),
    },
    {
      label: t.champs.modesPaiement,
      avant: profile.modesPaiement.map((m) => m.nom).join(", "),
      apres: profile.pendingModesPaiement.map((m) => m.nom).join(", "),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <AdminPageHeader title={`${profile.prenom} ${profile.nom}`} description={profile.user.email} />

      <div className="blueprint relative p-6" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <div className="mb-4 grid grid-cols-2 gap-4">
          <PhotoCompare label={t.photoActuelle} url={profile.photoUrl} />
          <PhotoCompare label={t.photoProposee} url={profile.pendingPhotoUrl} />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <PhotoCompare label={t.fondCarteActuel} url={profile.carteBackgroundUrl} aspect="video" />
          <PhotoCompare label={t.fondCartePropose} url={profile.pendingCarteBackgroundUrl} aspect="video" />
        </div>

        <div className="flex flex-col">
          {champs.map((champ, index) => (
            <Champ
              key={champ.label}
              {...champ}
              proposeLabel={t.propose}
              videMarqueur={t.videMarqueur}
              last={index === champs.length - 1}
            />
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Galerie label={t.galerieActuelle} urls={profile.galerie} aucunePhoto={t.aucunePhoto} />
          <Galerie label={t.galerieProposee} urls={profile.pendingGalerie} aucunePhoto={t.aucunePhoto} />
        </div>

        <ModificationActions id={profile.id} />
      </div>
    </div>
  );
}
