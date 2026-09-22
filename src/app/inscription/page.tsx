"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function InscriptionPage() {
  const router = useRouter();
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
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Une erreur est survenue");
      }

      setSuccess(true);
      setTimeout(() => router.push("/connexion"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
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
          <div className="kicker mx-auto">Demande envoyée</div>
          <h1 style={{ fontSize: 28 }}>Merci !</h1>
          <p style={{ color: "var(--color-neutral-700)" }}>
            Votre demande d&apos;inscription est en attente de validation par un administrateur.
          </p>
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
          <div className="kicker">Devenir chauffeur</div>
          <h1 style={{ fontSize: 30, lineHeight: 1, letterSpacing: "-0.02em" }}>
            Demande d&apos;inscription
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom" value={form.nom} onChange={(v) => update("nom", v)} required />
            <Field label="Prénom" value={form.prenom} onChange={(v) => update("prenom", v)} required />
          </div>
          <Field
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          <Field
            label="Téléphone"
            type="tel"
            value={form.telephone}
            onChange={(v) => update("telephone", v)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ville" value={form.ville} onChange={(v) => update("ville", v)} required />
            <Field
              label="Code postal"
              value={form.codePostal}
              onChange={(v) => update("codePostal", v)}
              required
            />
          </div>
          <Field
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            required
          />

          {error && (
            <p className="text-sm" style={{ color: "#b3261e" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block blueprint relative mt-1 uppercase tracking-[0.08em]"
            style={{ height: 42 }}
          >
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            {loading ? "Envoi..." : "Envoyer la demande"}
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
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}
