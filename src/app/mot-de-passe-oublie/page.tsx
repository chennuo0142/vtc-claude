"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

export default function MotDePasseOubliePage() {
  const { dict } = useLanguage();
  const t = dict.motDePasseOublie;
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) {
        setError(t.trop);
        return;
      }
      if (!res.ok) {
        setError(dict.common.erreurGenerique);
        return;
      }
      // Même message quel que soit le résultat côté serveur.
      setSent(true);
    } catch {
      setError(dict.common.erreurGenerique);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-2 text-xl font-bold">{t.titre}</h1>

      {sent ? (
        <div className="flex flex-col gap-4">
          <p
            className="border px-4 py-3 text-sm"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
          >
            {t.confirmation}
          </p>
          <Link href="/connexion" className="text-sm underline">
            {t.retourConnexion}
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-sm">{t.intro}</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{t.email}</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
              />
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              {loading ? t.envoiEnCours : t.envoyer}
            </button>
            <Link href="/connexion" className="text-sm underline">
              {t.retourConnexion}
            </Link>
          </form>
        </>
      )}
    </div>
  );
}
