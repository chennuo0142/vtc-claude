"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIE_LABELS } from "@/lib/vehicule";

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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(vehicule);

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
        throw new Error(data?.error ?? "Une erreur est survenue");
      }
      const result = await res.json();
      router.push(`/admin/vehicules/${result.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Catégorie</span>
        <select
          name="categorie"
          required
          defaultValue={vehicule?.categorie ?? ""}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
        >
          <option value="">Sélectionner une catégorie</option>
          {Object.entries(CATEGORIE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Nombre de places</span>
        <input
          type="number"
          name="nombrePlaces"
          min={1}
          max={50}
          required
          defaultValue={vehicule?.nombrePlaces}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Marque</span>
        <input
          type="text"
          name="marque"
          required
          defaultValue={vehicule?.marque}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Modèle</span>
        <input
          type="text"
          name="modele"
          required
          defaultValue={vehicule?.modele}
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Photo{isEdit ? " (laisser vide pour conserver l'actuelle)" : ""}</span>
        {vehicule?.photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={vehicule.photoUrl}
            alt=""
            className="mb-2 h-24 w-24 rounded-lg object-cover"
          />
        )}
        <input type="file" name="photo" accept="image/png,image/jpeg,image/webp" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {loading
          ? isEdit
            ? "Enregistrement..."
            : "Ajout..."
          : isEdit
            ? "Enregistrer les modifications"
            : "Ajouter le véhicule"}
      </button>
    </form>
  );
}
