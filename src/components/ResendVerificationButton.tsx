"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";

export default function ResendVerificationButton({ email }: { email: string }) {
  const { dict } = useLanguage();
  const t = dict.verifierEmail;
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "rateLimited" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.status === 429) setStatus("rateLimited");
      else setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {status === "sent" && (
        <p
          className="border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
        >
          {t.renvoye}
        </p>
      )}
      {status === "rateLimited" && <p className="text-sm text-red-600">{t.trop429}</p>}
      {status === "error" && <p className="text-sm text-red-600">{dict.common.erreurGenerique}</p>}
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "loading"}
        className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/10 dark:hover:bg-white/10"
      >
        {status === "loading" ? t.renvoiEnCours : t.renvoyer}
      </button>
    </div>
  );
}
