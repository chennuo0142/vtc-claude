"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import PasswordInput from "@/components/PasswordInput";

function ResetNotice() {
  const { dict } = useLanguage();
  const searchParams = useSearchParams();
  if (searchParams.get("reset") !== "1") return null;
  return (
    <p
      className="mb-4 border px-4 py-3 text-sm"
      style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
    >
      {dict.connexion.motDePasseReinitialise}
    </p>
  );
}

export default function ConnexionPage() {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.connexion;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(t.erreurIdentifiants);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <h1 className="mb-6 text-xl font-bold">{t.titre}</h1>
      <Suspense>
        <ResetNotice />
      </Suspense>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t.email}</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">{t.motDePasse}</span>
          <PasswordInput
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 outline-none focus:border-black/40 dark:border-white/10 dark:focus:border-white/40"
          />
        </label>
        <Link href="/mot-de-passe-oublie" className="self-start text-sm underline">
          {t.motDePasseOublie}
        </Link>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {loading ? t.connexionEnCours : t.seConnecter}
        </button>
      </form>
    </div>
  );
}
