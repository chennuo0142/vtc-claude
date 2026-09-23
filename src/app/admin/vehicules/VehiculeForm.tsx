"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

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

type VehiculeInitial = {
  id: string;
  categorie: string;
  nombrePlaces: number;
  marque: string;
  modele: string;
  photoUrl: string | null;
};

export default function VehiculeForm({ vehicule }: { vehicule?: VehiculeInitial }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminVehicules.form;
  const [preview, setPreview] = useState<string | null>(vehicule?.photoUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(vehicule);

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const url = isEdit ? `/api/admin/vehicules/${vehicule!.id}` : "/api/admin/vehicules";
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t.erreurGenerique);
      }
      const result = await res.json();
      router.push(`/admin/vehicules/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.erreurGenerique);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="vf-categorie">{t.categorie}</label>
        <select
          id="vf-categorie"
          name="categorie"
          required
          defaultValue={vehicule?.categorie ?? ""}
          className="input"
        >
          <option value="">{t.selectionnerCategorie}</option>
          {Object.entries(dict.common.categories).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="vf-nombrePlaces">{t.nombrePlaces}</label>
        <input
          id="vf-nombrePlaces"
          type="number"
          name="nombrePlaces"
          min={1}
          max={50}
          required
          defaultValue={vehicule?.nombrePlaces}
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="vf-marque">{t.marque}</label>
        <input id="vf-marque" type="text" name="marque" required defaultValue={vehicule?.marque} className="input" />
      </div>

      <div className="field">
        <label htmlFor="vf-modele">{t.modele}</label>
        <input id="vf-modele" type="text" name="modele" required defaultValue={vehicule?.modele} className="input" />
      </div>

      <div className="flex items-center gap-4">
        <div className="blueprint relative h-20 w-20 shrink-0 overflow-hidden">
          <Corners />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="hatch h-full w-full" />
          )}
        </div>
        <div className="field m-0">
          <label htmlFor="vf-photo">{t.photo}{isEdit ? t.photoConserverActuelle : ""}</label>
          <input
            id="vf-photo"
            type="file"
            name="photo"
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePhotoChange}
            className="text-sm"
          />
        </div>
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary blueprint relative mt-2 self-start">
        <Corners />
        {loading
          ? isEdit
            ? t.enregistrement
            : t.ajout
          : isEdit
            ? t.enregistrerModifications
            : t.ajouterVehicule}
      </button>
    </form>
  );
}
