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

type Props = {
  apiBase: string;
  redirectListPath: string;
  id?: string;
  initialNom?: string;
  label: string;
};

export default function CatalogueForm({ apiBase, redirectListPath, id, initialNom, label }: Props) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminCatalogue;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const url = isEdit ? `${apiBase}/${id}` : apiBase;
      const res = await fetch(url, { method: isEdit ? "PATCH" : "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? dict.common.erreurGenerique);
      }
      router.push(redirectListPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.erreurGenerique);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="cf-nom">{label}</label>
        <input id="cf-nom" type="text" name="nom" required defaultValue={initialNom} className="input" />
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary blueprint relative mt-2 self-start">
        <Corners />
        {loading
          ? isEdit
            ? dict.common.enregistrement
            : dict.common.ajout
          : isEdit
            ? t.enregistrerModifications
            : dict.common.ajouter}
      </button>
    </form>
  );
}
