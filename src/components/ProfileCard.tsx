import Image from "next/image";
import Link from "next/link";
import { formatLangue, parseLangues } from "@/lib/langues";
import { CarIcon } from "@/components/icons";

type ProfileCardProps = {
  id: string;
  nom: string;
  prenom: string;
  photoUrl?: string | null;
  carteBackgroundUrl?: string | null;
  ville?: string | null;
  bio?: string | null;
  numeroReference?: string | null;
  langues?: unknown;
  vehiculePhotoUrl?: string | null;
  vehiculeMarque?: string | null;
  vehiculeModele?: string | null;
};

export default function ProfileCard({
  id,
  nom,
  prenom,
  photoUrl,
  carteBackgroundUrl,
  ville,
  bio,
  numeroReference,
  langues,
  vehiculeMarque,
  vehiculeModele,
}: ProfileCardProps) {
  const vehiculeLabel = [vehiculeMarque, vehiculeModele].filter(Boolean).join(" ");
  const extrait = bio ? (bio.length > 100 ? `${bio.slice(0, 100)}…` : bio) : null;
  const languesParlees = parseLangues(langues).map(formatLangue);
  const initiales = `${prenom.charAt(0)}${nom.charAt(0)}`;
  const image = carteBackgroundUrl || photoUrl;

  return (
    <Link href={`/profil/${id}`} className="blueprint flex flex-col" style={{ background: "var(--color-bg)" }}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />

      <div
        className="relative aspect-[4/5] border-b"
        style={{ borderColor: "var(--color-divider)" }}
      >
        {image ? (
          <Image src={image} alt={`${prenom} ${nom}`} fill className="object-cover" />
        ) : (
          <div className="hatch flex h-full w-full items-center justify-center">
            <span
              className="text-[46px] font-semibold tracking-[0.06em]"
              style={{ fontFamily: "var(--font-heading)", color: "var(--color-accent-700)" }}
            >
              {initiales}
            </span>
          </div>
        )}
        {ville && (
          <span
            className="absolute left-0 top-0 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em]"
            style={{ fontFamily: "var(--font-heading)", background: "var(--color-accent-900)", color: "var(--color-bg)" }}
          >
            {ville}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5 pt-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[20px] font-semibold leading-tight" style={{ fontFamily: "var(--font-heading)" }}>
            {prenom} {nom}
          </span>
          {numeroReference && (
            <span
              className="shrink-0 font-mono text-[11px]"
              style={{ color: "var(--color-neutral-700)" }}
            >
              #{numeroReference}
            </span>
          )}
        </div>

        {extrait && (
          <p className="m-0 text-[12px] leading-[1.45]" style={{ color: "var(--color-neutral-800)" }}>
            {extrait}
          </p>
        )}

        {languesParlees.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {languesParlees.map((l, i) => (
              <span key={i} className="tag tag-outline">
                {l.drapeau} {l.libelle}
              </span>
            ))}
          </div>
        )}

        {vehiculeLabel && (
          <div
            className="mt-auto flex items-start gap-1.5 border-t pt-2.5 text-[12.5px]"
            style={{ borderColor: "var(--color-divider)", color: "var(--color-neutral-800)" }}
          >
            <span className="shrink-0" style={{ color: "var(--color-accent-700)" }}>
              <CarIcon className="h-[15px] w-[15px]" />
            </span>
            <span className="leading-[1.3]">{vehiculeLabel}</span>
          </div>
        )}
      </div>

      <div className="p-3.5 pt-3">
        <span className="btn btn-secondary btn-block uppercase tracking-[0.08em] hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] hover:border-[var(--color-accent)]">
          Voir le profil
        </span>
      </div>
    </Link>
  );
}
