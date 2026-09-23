"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUE_OPTIONS } from "@/lib/langues";
import type { ProfilFiltres } from "@/lib/profilFilters";
import { useLanguage } from "@/lib/i18n/context";

export default function FiltresBar({ filtres }: { filtres: ProfilFiltres }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.filtresBar;
  const [langue, setLangue] = useState(filtres.langue ?? "");
  const [ville, setVille] = useState(filtres.ville ?? "");
  const [modele, setModele] = useState(filtres.modele ?? "");
  const [places, setPlaces] = useState(filtres.placesMin?.toString() ?? "");

  const hasFiltres = Boolean(
    filtres.langue || filtres.ville || filtres.modele || filtres.placesMin
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (langue) params.set("langue", langue);
    if (ville.trim()) params.set("ville", ville.trim());
    if (modele.trim()) params.set("modele", modele.trim());
    if (places.trim()) params.set("places", places.trim());
    router.push(`/?${params.toString()}`);
  }

  function handleReset() {
    setLangue("");
    setVille("");
    setModele("");
    setPlaces("");
    router.push("/");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 border-b px-1 py-6 md:sticky md:top-[57px] md:border-b-0 md:border-r md:px-5 md:py-6"
      style={{ borderColor: "var(--color-divider)" }}
    >
      <div className="flex items-baseline justify-between">
        <h6 style={{ color: "var(--color-neutral-700)" }}>{t.titre}</h6>
        {hasFiltres && (
          <button type="button" onClick={handleReset} className="text-[11.5px]" style={{ color: "var(--color-accent)" }}>
            {t.toutEffacer}
          </button>
        )}
      </div>

      <div className="field">
        <label htmlFor="filtre-ville">{t.labelVille}</label>
        <input
          id="filtre-ville"
          type="text"
          value={ville}
          onChange={(e) => setVille(e.target.value)}
          placeholder={t.placeholderVille}
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="filtre-langue">{t.labelLangue}</label>
        <select
          id="filtre-langue"
          value={langue}
          onChange={(e) => setLangue(e.target.value)}
          className="input"
        >
          <option value="">{t.toutesLangues}</option>
          {LANGUE_OPTIONS.map((o) => (
            <option key={o.code} value={o.code}>
              {o.drapeau} {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="filtre-modele">{t.labelModele}</label>
        <input
          id="filtre-modele"
          type="text"
          value={modele}
          onChange={(e) => setModele(e.target.value)}
          placeholder={t.placeholderModele}
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="filtre-places">{t.labelPlaces}</label>
        <input
          id="filtre-places"
          type="number"
          min={1}
          value={places}
          onChange={(e) => setPlaces(e.target.value)}
          placeholder={t.placeholderPlaces}
          className="input"
        />
      </div>

      <button type="submit" className="btn btn-primary btn-block blueprint relative uppercase tracking-[0.08em]" style={{ height: 38 }}>
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        {t.appliquer}
      </button>
    </form>
  );
}
