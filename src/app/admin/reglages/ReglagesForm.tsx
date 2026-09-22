"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReglagesForm({ cardsPerPage }: { cardsPerPage: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/admin/reglages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardsPerPage: formData.get("cardsPerPage") }),
      });
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Nombre de cartes par page (annuaire)</span>
        <input
          type="number"
          name="cardsPerPage"
          min={1}
          max={100}
          defaultValue={cardsPerPage}
          required
          className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Réglages enregistrés !</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 self-start rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
