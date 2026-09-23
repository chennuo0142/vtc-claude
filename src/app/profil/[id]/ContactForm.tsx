"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

export default function ContactForm({ userId }: { userId: string }) {
  const { dict } = useLanguage();
  const t = dict.contactForm;
  const common = dict.common;
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/contact/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, email, message }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? common.erreurGenerique);
      }

      setSuccess(true);
      setNom("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : common.erreurGenerique);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p
        className="border px-4 py-3 text-sm"
        style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
      >
        {t.succes}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="contact-nom">{t.nom}</label>
          <input id="contact-nom" required value={nom} onChange={(e) => setNom(e.target.value)} className="input" />
        </div>
        <div className="field">
          <label htmlFor="contact-email">{t.email}</label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="contact-message">{t.message}</label>
        <textarea
          id="contact-message"
          required
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input"
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: "#b3261e" }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary blueprint relative uppercase tracking-[0.08em]"
          style={{ height: 40, paddingInline: 26 }}
        >
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          {loading ? t.envoi : t.envoyer}
        </button>
      </div>
    </form>
  );
}
