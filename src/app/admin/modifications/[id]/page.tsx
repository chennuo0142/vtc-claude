import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseLangues, formatLangue } from "@/lib/langues";
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

function Champ({
  label,
  avant,
  apres,
}: {
  label: string;
  avant: string;
  apres: string;
}) {
  const change = avant !== apres;
  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      <div>
        <p className="text-xs font-medium uppercase text-neutral-400">{label}</p>
        <p className="text-sm">{avant || "—"}</p>
      </div>
      <div>
        <p className="text-xs font-medium uppercase text-neutral-400">Proposé</p>
        <p className={`text-sm ${change ? "font-semibold text-amber-600" : "text-neutral-500"}`}>
          {apres || "—"}
        </p>
      </div>
    </div>
  );
}

function Galerie({ urls, label }: { urls: string[]; label: string }) {
  const photos = urls.filter(Boolean);
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase text-neutral-400">{label}</p>
      {photos.length === 0 ? (
        <p className="text-sm text-neutral-400">Aucune photo</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function ModificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: { user: true, vehicule: true, pendingVehicule: true },
  });

  if (!profile || !profile.hasPendingChanges) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/admin/modifications" className="mb-6 inline-block text-sm text-neutral-500 hover:underline">
        ← Retour à la liste
      </Link>

      <h1 className="mb-1 text-xl font-bold">
        {profile.prenom} {profile.nom}
      </h1>
      <p className="mb-6 text-sm text-neutral-500">{profile.user.email}</p>

      <div className="rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-400">Photo actuelle</p>
            <div className="relative mt-1 h-24 w-24 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {profile.photoUrl && <Image src={profile.photoUrl} alt="" fill className="object-cover" />}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-neutral-400">Photo proposée</p>
            <div className="relative mt-1 h-24 w-24 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {profile.pendingPhotoUrl && (
                <Image src={profile.pendingPhotoUrl} alt="" fill className="object-cover" />
              )}
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium uppercase text-neutral-400">Fond de carte actuel</p>
            <div className="relative mt-1 aspect-video w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {profile.carteBackgroundUrl && (
                <Image src={profile.carteBackgroundUrl} alt="" fill className="object-cover" />
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-neutral-400">Fond de carte proposé</p>
            <div className="relative mt-1 aspect-video w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
              {profile.pendingCarteBackgroundUrl && (
                <Image src={profile.pendingCarteBackgroundUrl} alt="" fill className="object-cover" />
              )}
            </div>
          </div>
        </div>

        <div className="divide-y divide-black/10 dark:divide-white/10">
          <Champ label="Nom" avant={profile.nom} apres={profile.pendingNom ?? ""} />
          <Champ label="Prénom" avant={profile.prenom} apres={profile.pendingPrenom ?? ""} />
          <Champ label="Bio" avant={profile.bio ?? ""} apres={profile.pendingBio ?? ""} />
          <Champ label="Téléphone" avant={profile.telephone} apres={profile.pendingTelephone ?? ""} />
          <Champ label="Ville" avant={profile.ville} apres={profile.pendingVille ?? ""} />
          <Champ label="Code postal" avant={profile.codePostal} apres={profile.pendingCodePostal ?? ""} />
          <Champ
            label="Email de contact"
            avant={profile.emailContact ?? ""}
            apres={profile.pendingEmailContact ?? ""}
          />
          <Champ
            label="Langues parlées"
            avant={formatLanguesList(profile.langues)}
            apres={formatLanguesList(profile.pendingLangues)}
          />
          <Champ
            label="Véhicule"
            avant={profile.vehicule ? `${profile.vehicule.marque} ${profile.vehicule.modele}` : ""}
            apres={profile.pendingVehicule ? `${profile.pendingVehicule.marque} ${profile.pendingVehicule.modele}` : ""}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <Galerie label="Galerie actuelle" urls={profile.galerie} />
          <Galerie label="Galerie proposée" urls={profile.pendingGalerie} />
        </div>

        <ModificationActions id={profile.id} />
      </div>
    </div>
  );
}
