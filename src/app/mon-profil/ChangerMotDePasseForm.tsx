"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import PasswordInput from "@/components/PasswordInput";

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

export default function ChangerMotDePasseForm() {
  const { dict } = useLanguage();
  const t = dict.changerMotDePasse;
  const common = dict.common;

  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [confirmationMotDePasse, setConfirmationMotDePasse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (nouveauMotDePasse !== confirmationMotDePasse) {
      setError(t.erreurCorrespondance);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profil/mot-de-passe", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motDePasseActuel, nouveauMotDePasse, confirmationMotDePasse }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? common.erreurGenerique);
      }
      setSuccess(true);
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setConfirmationMotDePasse("");
    } catch (err) {
      setError(err instanceof Error ? err.message : common.erreurGenerique);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="blueprint relative flex flex-col gap-4 p-5"
      style={{ background: "var(--color-surface)" }}
    >
      <Corners />
      <h6 style={{ color: "var(--color-neutral-700)" }}>{t.titre}</h6>

      <div className="field">
        <label htmlFor="mp-motDePasseActuel">{t.motDePasseActuel}</label>
        <PasswordInput
          id="mp-motDePasseActuel"
          autoComplete="current-password"
          value={motDePasseActuel}
          onChange={(e) => setMotDePasseActuel(e.target.value)}
          required
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="mp-nouveauMotDePasse">{t.nouveauMotDePasse}</label>
          <PasswordInput
            id="mp-nouveauMotDePasse"
            autoComplete="new-password"
            minLength={8}
            value={nouveauMotDePasse}
            onChange={(e) => setNouveauMotDePasse(e.target.value)}
            required
            className="input"
          />
        </div>
        <div className="field">
          <label htmlFor="mp-confirmationMotDePasse">{t.confirmationMotDePasse}</label>
          <PasswordInput
            id="mp-confirmationMotDePasse"
            autoComplete="new-password"
            minLength={8}
            value={confirmationMotDePasse}
            onChange={(e) => setConfirmationMotDePasse(e.target.value)}
            required
            className="input"
          />
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
        className="btn btn-primary blueprint relative mt-1 self-start uppercase tracking-[0.08em]"
        style={{ height: 42, paddingInline: 20 }}
      >
        <Corners />
        {loading ? t.boutonEnCours : t.bouton}
      </button>
    </form>
  );
}
