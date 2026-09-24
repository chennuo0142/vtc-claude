"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import PasswordInput from "@/components/PasswordInput";

const inputClass =
  "w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.motDePasseOublie;
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invalidLink, setInvalidLink] = useState(!token);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setError(t.erreurCorrespondance);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, nouveauMotDePasse, confirmationMotDePasse }),
      });
      if (res.ok) {
        router.push("/connexion?reset=1");
        return;
      }
      if (res.status === 429) {
        setError(t.trop);
      } else if (res.status === 400) {
        const data = await res.json().catch(() => null);
        // Jeton refusé ⇒ message unique ; autre 400 ⇒ erreur de validation du mot de passe.
        if (data?.error === "Lien invalide ou expiré") setInvalidLink(true);
        else setError(data?.error ?? dict.common.erreurGenerique);
      } else {
        setError(dict.common.erreurGenerique);
      }
    } catch {
      setError(dict.common.erreurGenerique);
    } finally {
      setLoading(false);
    }
  }

  if (invalidLink) {
    return (
      <div className="mx-auto max-w-md px-6 py-12">
        <h1 className="mb-4 text-xl font-bold">{t.titreReset}</h1>
        <p className="mb-4 text-sm text-red-600">{t.lienInvalide}</p>
        <Link href="/mot-de-passe-oublie" className="text-sm underline">
          {t.demanderNouveauLien}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-6 text-xl font-bold">{t.titreReset}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t.nouveauMotDePasse}</span>
          <PasswordInput
            required
            minLength={8}
            autoComplete="new-password"
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t.confirmationMotDePasse}</span>
          <PasswordInput
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmationMotDePasse}
            onChange={(e) => setConfirmationMotDePasse(e.target.value)}
            className={inputClass}
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {loading ? t.validerEnCours : t.valider}
        </button>
      </form>
    </div>
  );
}
