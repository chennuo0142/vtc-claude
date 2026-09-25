"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";

type State = "loading" | "success" | "invalid" | "rateLimited" | "error";

export default function VerifyEmailClient({ token }: { token: string }) {
  const { dict } = useLanguage();
  const t = dict.verifierEmail;
  const [state, setState] = useState<State>(token ? "loading" : "invalid");
  // Le jeton est à usage unique : on évite le double appel de l'effet en StrictMode.
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => {
        if (res.ok) setState("success");
        else if (res.status === 429) setState("rateLimited");
        else if (res.status === 400) setState("invalid");
        else setState("error");
      })
      .catch(() => setState("error"));
  }, [token]);

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-4 text-xl font-bold">{t.titre}</h1>
      {state === "loading" && <p className="text-sm">{t.verification}</p>}
      {state === "success" && (
        <div className="flex flex-col gap-4">
          <p
            className="border px-4 py-3 text-sm"
            style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
          >
            {t.succes}
          </p>
          <Link href="/connexion" className="text-sm underline">
            {t.seConnecter}
          </Link>
        </div>
      )}
      {state === "invalid" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-600">{t.lienInvalide}</p>
          <Link href="/connexion" className="text-sm underline">
            {t.seConnecter}
          </Link>
        </div>
      )}
      {state === "rateLimited" && <p className="text-sm text-red-600">{t.trop}</p>}
      {state === "error" && <p className="text-sm text-red-600">{dict.common.erreurGenerique}</p>}
    </div>
  );
}
