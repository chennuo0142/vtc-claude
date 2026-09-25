"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import PasswordInput from "@/components/PasswordInput";
import ResendVerificationButton from "@/components/ResendVerificationButton";
import TurnstileWidget, { type TurnstileHandle } from "@/components/TurnstileWidget";

export default function InscriptionPage() {
  const { dict } = useLanguage();
  const t = dict.inscription;
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    ville: "",
    codePostal: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileHandle>(null);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/inscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (res.status === 429) throw new Error(t.trop);
        if (data?.code === "antibot") throw new Error(dict.common.erreurAntibot);
        throw new Error(data?.error ?? dict.common.erreurGenerique);
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.erreurGenerique);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <div
          className="blueprint relative flex flex-col gap-2 p-6 text-center"
          style={{ background: "var(--color-surface)" }}
        >
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="kicker mx-auto">{t.kickerEnvoyee}</div>
          <h1 style={{ fontSize: 28 }}>{t.merci}</h1>
          <p style={{ color: "var(--color-neutral-700)" }}>
            {t.messageEnvoyee}
          </p>
          <div className="mt-2 flex flex-col gap-3">
            <ResendVerificationButton email={form.email} />
            <Link href="/connexion" className="text-sm underline">
              {t.retourConnexion}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div
        className="blueprint relative flex flex-col gap-5 p-6"
        style={{ background: "var(--color-surface)" }}
      >
        <i className="corner tl" />
        <i className="corner tr" />
        <i className="corner bl" />
        <i className="corner br" />
        <div className="flex flex-col gap-1">
          <div className="kicker">{t.kickerDevenirChauffeur}</div>
          <h1 style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em" }}>
            {t.titre}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.champNom} value={form.nom} onChange={(v) => update("nom", v)} required />
            <Field label={t.champPrenom} value={form.prenom} onChange={(v) => update("prenom", v)} required />
          </div>
          <Field
            label={t.champEmail}
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          <Field
            label={t.champTelephone}
            type="tel"
            value={form.telephone}
            onChange={(v) => update("telephone", v)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.champVille} value={form.ville} onChange={(v) => update("ville", v)} required />
            <Field
              label={t.champCodePostal}
              value={form.codePostal}
              onChange={(v) => update("codePostal", v)}
              required
            />
          </div>
          <Field
            label={t.champMotDePasse}
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            required
          />

          <TurnstileWidget ref={turnstileRef} onToken={setTurnstileToken} />

          {error && (
            <p className="text-sm" style={{ color: "#b3261e" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !turnstileToken}
            className="btn btn-primary btn-block blueprint relative mt-1 uppercase tracking-[0.08em]"
            style={{ height: 42 }}
          >
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            {loading ? t.envoiEnCours : t.envoyerLaDemande}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {type === "password" ? (
        <PasswordInput
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      ) : (
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="input"
        />
      )}
    </div>
  );
}
