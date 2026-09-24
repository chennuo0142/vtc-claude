"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUE_OPTIONS, type LangueCode, type LangueEntry } from "@/lib/langues";
import { useLanguage } from "@/lib/i18n/context";
import { CameraIcon } from "@/components/icons";

type VehiculeOption = {
  id: string;
  label: string;
};

type CatalogueOption = {
  id: string;
  nom: string;
};

export type MonProfilFormProps = {
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
  nombrePlaces: number | null;
  annee: number | null;
  galerie: string[];
  langues: LangueEntry[];
  vehicules: VehiculeOption[];
  zones: CatalogueOption[];
  selectedZoneIds: string[];
  options: CatalogueOption[];
  selectedOptionIds: string[];
  modesPaiement: CatalogueOption[];
  selectedModePaiementIds: string[];
};

export type MonProfilSection =
  | "identite"
  | "coordonnees"
  | "vehicule"
  | "langues"
  | "galerie"
  | "zones"
  | "options"
  | "paiement"
  | "motDePasse"
  | "messages";

const FORM_SECTIONS: MonProfilSection[] = [
  "identite",
  "coordonnees",
  "vehicule",
  "langues",
  "galerie",
  "zones",
  "options",
  "paiement",
];

const MAX_LANGUES = 3;
const MAX_ZONES = 4;

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
  nombrePlaces,
  annee,
  galerie,
  langues,
  vehicules,
  zones,
  selectedZoneIds: initialSelectedZoneIds,
  options,
  selectedOptionIds: initialSelectedOptionIds,
  modesPaiement,
  selectedModePaiementIds: initialSelectedModePaiementIds,
  section,
}: MonProfilFormProps & { section: MonProfilSection }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.monProfilForm;
  const common = dict.common;
  const photoInputRef = useRef<HTMLInputElement>(null);
  const carteBackgroundInputRef = useRef<HTMLInputElement>(null);
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
  const [selectedZoneIds, setSelectedZoneIds] = useState<string[]>(initialSelectedZoneIds);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>(initialSelectedOptionIds);
  const [selectedModePaiementIds, setSelectedModePaiementIds] = useState<string[]>(
    initialSelectedModePaiementIds
  );
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

  function toggleZone(id: string) {
    setSelectedZoneIds((prev) => {
      if (prev.includes(id)) return prev.filter((z) => z !== id);
      if (prev.length >= MAX_ZONES) return prev;
      return [...prev, id];
    });
  }

  function toggleOption(id: string) {
    setSelectedOptionIds((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
  }

  function toggleModePaiement(id: string) {
    setSelectedModePaiementIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
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
        throw new Error(data?.error ?? common.erreurGenerique);
      }
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : common.erreurGenerique);
    } finally {
      setLoading(false);
    }
  }

  const show = (key: MonProfilSection) => (section === key ? "" : "hidden");

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-6 ${FORM_SECTIONS.includes(section) ? "" : "hidden"}`}>
      <div className={show("identite")}>
      <div className="blueprint relative flex flex-col gap-4 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.identite.titre}</h6>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="mp-prenom">{t.identite.prenom}</label>
            <input id="mp-prenom" name="prenom" defaultValue={prenom} className="input" />
          </div>
          <div className="field">
            <label htmlFor="mp-nom">{t.identite.nom}</label>
            <input id="mp-nom" name="nom" defaultValue={nom} className="input" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            aria-label={t.identite.photoLabel}
            title={t.identite.photoLabel}
            className="blueprint group relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden p-0"
          >
            <Corners />
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={t.identite.photoAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="hatch h-full w-full" />
            )}
            <span
              className={`absolute inset-0 flex items-center justify-center transition ${
                preview ? "bg-black/0 text-white opacity-0 group-hover:bg-black/40 group-hover:opacity-100" : ""
              }`}
              style={preview ? undefined : { color: "var(--color-accent-700)" }}
            >
              <CameraIcon className="h-7 w-7" />
            </span>
          </button>
          <span className="text-sm" style={{ color: "var(--color-neutral-800)" }}>
            {t.identite.photoLabel}
          </span>
          <input
            ref={photoInputRef}
            id="mp-photo"
            type="file"
            name="photo"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div className="field">
          <label>{t.identite.carteBackgroundLabel}</label>
          <button
            type="button"
            onClick={() => carteBackgroundInputRef.current?.click()}
            aria-label={t.identite.carteBackgroundLabel}
            title={t.identite.carteBackgroundLabel}
            className="blueprint group relative aspect-video w-full cursor-pointer overflow-hidden p-0"
          >
            <Corners />
            {carteBackgroundPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={carteBackgroundPreview} alt={t.identite.carteBackgroundAlt} className="h-full w-full object-cover" />
            ) : (
              <div className="hatch h-full w-full" />
            )}
            <span
              className={`absolute inset-0 flex items-center justify-center transition ${
                carteBackgroundPreview
                  ? "bg-black/0 text-white opacity-0 group-hover:bg-black/40 group-hover:opacity-100"
                  : ""
              }`}
              style={carteBackgroundPreview ? undefined : { color: "var(--color-accent-700)" }}
            >
              <CameraIcon className="h-10 w-10" />
            </span>
          </button>
          {carteBackgroundPreview && (
            <button
              type="button"
              onClick={handleCarteBackgroundRemove}
              className="mt-2 self-start text-xs uppercase tracking-[0.08em]"
              style={{ color: "#b3261e" }}
            >
              {t.retirer}
            </button>
          )}
          <input
            ref={carteBackgroundInputRef}
            type="file"
            name="carteBackground"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleCarteBackgroundChange}
            className="hidden"
          />
          <input
            type="hidden"
            name="carteBackground_remove"
            value={carteBackgroundRemoved ? "on" : ""}
          />
        </div>

        <div className="field">
          <label htmlFor="mp-bio">{t.identite.bio}</label>
          <textarea id="mp-bio" name="bio" defaultValue={bio ?? ""} rows={5} className="input" />
        </div>
      </div>
      </div>

      <div className={show("coordonnees")}>
      <div className="blueprint relative flex flex-col gap-4 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.coordonnees.titre}</h6>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="mp-telephone">{t.coordonnees.telephone}</label>
            <input id="mp-telephone" name="telephone" defaultValue={telephone} className="input" />
          </div>
          <div className="field">
            <label htmlFor="mp-email">{t.coordonnees.email}</label>
            <input
              id="mp-email"
              type="email"
              name="emailContact"
              defaultValue={emailContact ?? ""}
              placeholder={t.coordonnees.emailPlaceholder}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="mp-ville">{t.coordonnees.ville}</label>
            <input id="mp-ville" name="ville" defaultValue={ville} className="input" />
          </div>
          <div className="field">
            <label htmlFor="mp-codePostal">{t.coordonnees.codePostal}</label>
            <input id="mp-codePostal" name="codePostal" defaultValue={codePostal} className="input" />
          </div>
        </div>
      </div>
      </div>

      <div className={show("vehicule")}>
      <div className="blueprint relative flex flex-col gap-4 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.vehicule.titre}</h6>

        <div className="field">
          <label htmlFor="mp-vehicule">{t.coordonnees.vehicule}</label>
          <select id="mp-vehicule" name="vehiculeId" defaultValue={vehiculeId ?? ""} className="input">
            <option value="">{t.coordonnees.aucunVehicule}</option>
            {vehicules.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label htmlFor="mp-nombrePlaces">{t.coordonnees.nombrePlaces}</label>
            <input
              id="mp-nombrePlaces"
              type="number"
              name="nombrePlaces"
              min={1}
              max={50}
              defaultValue={nombrePlaces ?? ""}
              className="input"
            />
          </div>
          <div className="field">
            <label htmlFor="mp-annee">{t.coordonnees.annee}</label>
            <input
              id="mp-annee"
              type="number"
              name="annee"
              min={1990}
              max={new Date().getFullYear() + 1}
              defaultValue={annee ?? ""}
              className="input"
            />
          </div>
        </div>
      </div>
      </div>

      <div className={show("zones")}>
      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.zones.titre}</h6>
        <div className="flex flex-col gap-2">
          {zones.map((zone) => {
            const checked = selectedZoneIds.includes(zone.id);
            const disabled = !checked && selectedZoneIds.length >= MAX_ZONES;
            return (
              <label
                key={zone.id}
                className={`flex w-fit items-center gap-2 text-[13px] ${disabled ? "opacity-40" : "cursor-pointer"}`}
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleZone(zone.id)}
                />
                <span className={checked ? "tag tag-outline" : ""}>{zone.nom}</span>
              </label>
            );
          })}
        </div>
        <input type="hidden" name="zoneIds" value={JSON.stringify(selectedZoneIds)} />
      </div>
      </div>

      <div className={show("options")}>
      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.optionsVehicule.titre}</h6>
        <div className="flex flex-col gap-2">
          {options.map((option) => {
            const checked = selectedOptionIds.includes(option.id);
            return (
              <label
                key={option.id}
                className="flex w-fit cursor-pointer items-center gap-2 text-[13px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <input type="checkbox" checked={checked} onChange={() => toggleOption(option.id)} />
                <span className={checked ? "tag tag-outline" : ""}>{option.nom}</span>
              </label>
            );
          })}
        </div>
        <input type="hidden" name="optionIds" value={JSON.stringify(selectedOptionIds)} />
      </div>
      </div>

      <div className={show("paiement")}>
      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.modesPaiement.titre}</h6>
        <div className="flex flex-col gap-2">
          {modesPaiement.map((modePaiement) => {
            const checked = selectedModePaiementIds.includes(modePaiement.id);
            return (
              <label
                key={modePaiement.id}
                className="flex w-fit cursor-pointer items-center gap-2 text-[13px]"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleModePaiement(modePaiement.id)}
                />
                <span className={checked ? "tag tag-outline" : ""}>{modePaiement.nom}</span>
              </label>
            );
          })}
        </div>
        <input type="hidden" name="modePaiementIds" value={JSON.stringify(selectedModePaiementIds)} />
      </div>
      </div>

      <div className={show("langues")}>
      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.langues.titre}</h6>
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
                        placeholder={t.langues.nomLanguePlaceholder}
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
                          aria-label={t.langues.niveau(niveau)}
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
      </div>

      <div className={show("galerie")}>
      <div className="blueprint relative flex flex-col gap-3 p-5" style={{ background: "var(--color-surface)" }}>
        <Corners />
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.galerie.titre}</h6>
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
                      {t.galerie.modifier}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => galerieInputRefs.current[index]?.click()}
                    className="hatch flex h-full w-full items-center justify-center text-3xl font-light"
                    style={{ color: "var(--color-accent-700)" }}
                    aria-label={t.galerie.ajouterPhoto}
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
                  {t.retirer}
                </button>
              )}
            </div>
          ))}
        </div>
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
          {t.success}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary blueprint relative mt-1 uppercase tracking-[0.08em]"
        style={{ height: 42 }}
      >
        <Corners />
        {loading ? common.enregistrement : common.enregistrer}
      </button>
    </form>
  );
}
