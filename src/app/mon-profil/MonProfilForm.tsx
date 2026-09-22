"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUE_OPTIONS, type LangueCode, type LangueEntry } from "@/lib/langues";

type VehiculeOption = {
  id: string;
  label: string;
};

type Props = {
  nom: string;
  prenom: string;
  photoUrl: string | null;
  carteBackgroundUrl: string | null;
  bio: string | null;
  telephone: string;
  ville: string;
  codePostal: string;
  emailContact: string | null;
  vehiculeId: string | null;
  galerie: string[];
  langues: LangueEntry[];
  vehicules: VehiculeOption[];
};

const MAX_LANGUES = 3;

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

export default function MonProfilForm({
  nom,
  prenom,
  photoUrl,
  carteBackgroundUrl,
  bio,
  telephone,
  ville,
  codePostal,
  emailContact,
  vehiculeId,
  galerie,
  langues,
  vehicules,
}: Props) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(photoUrl);
  const [carteBackgroundPreview, setCarteBackgroundPreview] = useState<string | null>(
    carteBackgroundUrl
  );
  const [carteBackgroundRemoved, setCarteBackgroundRemoved] = useState(false);
  const [galeriePreviews, setGaleriePreviews] = useState<(string | null)[]>(
    galerie.map((url) => url || null)
  );
  const [galerieRemoved, setGalerieRemoved] = useState<boolean[]>(galerie.map(() => false));
  const galerieInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [selectedLangues, setSelectedLangues] = useState<LangueEntry[]>(langues);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function handleCarteBackgroundChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setCarteBackgroundPreview(URL.createObjectURL(file));
      setCarteBackgroundRemoved(false);
    }
  }

  function handleCarteBackgroundRemove() {
    setCarteBackgroundPreview(null);
    setCarteBackgroundRemoved(true);
  }

  function handleGaleriePhotoChange(index: number, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setGaleriePreviews((prev) => {
        const next = [...prev];
        next[index] = URL.createObjectURL(file);
        return next;
      });
      setGalerieRemoved((prev) => {
        const next = [...prev];
        next[index] = false;
        return next;
      });
    }
  }

  function handleGalerieRemove(index: number) {
    setGaleriePreviews((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setGalerieRemoved((prev) => {
      const next = [...prev];
      next[index] = true;
      return next;
    });
  }

  function toggleLangue(code: LangueCode) {
    setSelectedLangues((prev) => {
      const exists = prev.some((l) => l.code === code);
      if (exists) {
        return prev.filter((l) => l.code !== code);
      }
      if (prev.length >= MAX_LANGUES) return prev;
      return [...prev, { code, niveau: 1 }];
    });
  }

  function setLangueNiveau(code: LangueCode, niveau: 1 | 2 | 3) {
    setSelectedLangues((prev) => prev.map((l) => (l.code === code ? { ...l, niveau } : l)));
  }

  function setLangueLabel(code: LangueCode, label: string) {
    setSelectedLangues((prev) => prev.map((l) => (l.code === code ? { ...l, label } : l)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/profil", { method: "PATCH", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Une erreur est survenue");
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="blueprint relative flex flex-col gap-4 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>Identité</h6>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="mp-prenom">Prénom</label>
            <input id="mp-prenom" name="prenom" defaultValue={prenom} className="input" />
          </div>
          <div className="field">
            <label htmlFor="mp-nom">Nom</label>
            <input id="mp-nom" name="nom" defaultValue={nom} className="input" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="blueprint relative h-20 w-20 shrink-0 overflow-hidden">
            <Corners />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Photo de profil" className="h-full w-full object-cover" />
            ) : (
              <div className="hatch h-full w-full" />
            )}
          </div>
          <div className="field m-0">
            <label htmlFor="mp-photo">Photo de profil</label>
            <input
              id="mp-photo"
              type="file"
              name="photo"
              accept="image/png,image/jpeg,image/webp"
              onChange={handlePhotoChange}
              className="text-sm"
            />
          </div>
        </div>

        <div className="field">
          <label>Image de fond de carte (facultatif)</label>
          <div className="blueprint relative aspect-video w-full overflow-hidden">
            <Corners />
            {carteBackgroundPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={carteBackgroundPreview} alt="Fond de carte" className="h-full w-full object-cover" />
            ) : (
              <div className="hatch h-full w-full" />
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <input
              type="file"
              name="carteBackground"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleCarteBackgroundChange}
              className="text-sm"
            />
            {carteBackgroundPreview && (
              <button
                type="button"
                onClick={handleCarteBackgroundRemove}
                className="text-xs uppercase tracking-[0.08em]"
                style={{ color: "#b3261e" }}
              >
                Retirer
              </button>
            )}
          </div>
          <input
            type="hidden"
            name="carteBackground_remove"
            value={carteBackgroundRemoved ? "on" : ""}
          />
        </div>

        <div className="field">
          <label htmlFor="mp-bio">Présentation</label>
          <textarea id="mp-bio" name="bio" defaultValue={bio ?? ""} rows={5} className="input" />
        </div>
      </div>

      <div className="blueprint relative flex flex-col gap-4 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>Coordonnées</h6>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="mp-telephone">Téléphone</label>
            <input id="mp-telephone" name="telephone" defaultValue={telephone} className="input" />
          </div>
          <div className="field">
            <label htmlFor="mp-email">Email de contact</label>
            <input
              id="mp-email"
              type="email"
              name="emailContact"
              defaultValue={emailContact ?? ""}
              placeholder="visible sur votre fiche publique"
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="mp-ville">Ville</label>
            <input id="mp-ville" name="ville" defaultValue={ville} className="input" />
          </div>
          <div className="field">
            <label htmlFor="mp-codePostal">Code postal</label>
            <input id="mp-codePostal" name="codePostal" defaultValue={codePostal} className="input" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="mp-vehicule">Véhicule</label>
          <select id="mp-vehicule" name="vehiculeId" defaultValue={vehiculeId ?? ""} className="input">
            <option value="">Aucun véhicule</option>
            {vehicules.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>Langues parlées (3 maximum)</h6>
        <div className="flex flex-col gap-3">
          {LANGUE_OPTIONS.map((option) => {
            const entry = selectedLangues.find((l) => l.code === option.code);
            const checked = Boolean(entry);
            const disabled = !checked && selectedLangues.length >= MAX_LANGUES;
            return (
              <div key={option.code} className="flex flex-col gap-2">
                <label
                  className={`flex w-fit items-center gap-2 text-[13px] ${disabled ? "opacity-40" : "cursor-pointer"}`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleLangue(option.code)}
                  />
                  <span className={checked ? "tag tag-outline" : ""}>
                    {option.drapeau} {option.label}
                  </span>
                </label>
                {entry && (
                  <div className="ml-6 flex items-center gap-3">
                    {option.code === "AUTRE" && (
                      <input
                        type="text"
                        placeholder="Nom de la langue"
                        value={entry.label ?? ""}
                        onChange={(e) => setLangueLabel(option.code, e.target.value)}
                        className="input"
                        style={{ maxWidth: 180, minHeight: 30 }}
                      />
                    )}
                    <div className="flex gap-1">
                      {[1, 2, 3].map((niveau) => (
                        <button
                          key={niveau}
                          type="button"
                          onClick={() => setLangueNiveau(option.code, niveau as 1 | 2 | 3)}
                          className="text-lg leading-none"
                          style={{ color: "var(--color-accent-700)" }}
                          aria-label={`Niveau ${niveau}`}
                        >
                          {niveau <= entry.niveau ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <input type="hidden" name="langues" value={JSON.stringify(selectedLangues)} />
      </div>

      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>Galerie photo (6 emplacements)</h6>
        <div className="grid grid-cols-3 gap-3">
          {galeriePreviews.map((preview, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="blueprint group relative aspect-square overflow-hidden">
                <Corners />
                {preview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => galerieInputRefs.current[index]?.click()}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 text-xs font-semibold uppercase tracking-[0.08em] text-white opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
                    >
                      Modifier
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => galerieInputRefs.current[index]?.click()}
                    className="hatch flex h-full w-full items-center justify-center text-3xl font-light"
                    style={{ color: "var(--color-accent-700)" }}
                    aria-label="Ajouter une photo"
                  >
                    +
                  </button>
                )}
              </div>
              <input
                ref={(el) => {
                  galerieInputRefs.current[index] = el;
                }}
                type="file"
                name={`gallery_${index}`}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleGaleriePhotoChange(index, e)}
              />
              <input
                type="hidden"
                name={`gallery_remove_${index}`}
                value={galerieRemoved[index] ? "on" : ""}
              />
              {preview && (
                <button
                  type="button"
                  onClick={() => handleGalerieRemove(index)}
                  className="text-xs uppercase tracking-[0.08em]"
                  style={{ color: "#b3261e" }}
                >
                  Retirer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#b3261e" }}>
          {error}
        </p>
      )}
      {success && (
        <p
          className="border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
        >
          Modifications envoyées, en attente de validation par un administrateur.
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary blueprint relative mt-1 uppercase tracking-[0.08em]"
        style={{ height: 42 }}
      >
        <Corners />
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
