"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

type ChauffeurInitial = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  codePostal: string;
};

export default function ChauffeurForm({ chauffeur }: { chauffeur: ChauffeurInitial }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminChauffeurs.form;

  const [email, setEmail] = useState(chauffeur.email);
  const [nom, setNom] = useState(chauffeur.nom);
  const [prenom, setPrenom] = useState(chauffeur.prenom);
  const [telephone, setTelephone] = useState(chauffeur.telephone);
  const [ville, setVille] = useState(chauffeur.ville);
  const [codePostal, setCodePostal] = useState(chauffeur.codePostal);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/chauffeurs/${chauffeur.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, nom, prenom, telephone, ville, codePostal, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t.erreurGenerique);
      }
      router.push("/admin/chauffeurs/liste");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.erreurGenerique);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="field">
        <label htmlFor="cf-email">{t.email}</label>
        <input
          id="cf-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="cf-prenom">{t.prenom}</label>
        <input id="cf-prenom" required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="input" />
      </div>

      <div className="field">
        <label htmlFor="cf-nom">{t.nom}</label>
        <input id="cf-nom" required value={nom} onChange={(e) => setNom(e.target.value)} className="input" />
      </div>

      <div className="field">
        <label htmlFor="cf-telephone">{t.telephone}</label>
        <input
          id="cf-telephone"
          required
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="cf-ville">{t.ville}</label>
        <input id="cf-ville" required value={ville} onChange={(e) => setVille(e.target.value)} className="input" />
      </div>

      <div className="field">
        <label htmlFor="cf-codePostal">{t.codePostal}</label>
        <input
          id="cf-codePostal"
          required
          value={codePostal}
          onChange={(e) => setCodePostal(e.target.value)}
          className="input"
        />
      </div>

      <div className="field">
        <label htmlFor="cf-password">
          {t.nouveauMotDePasse}
          {t.motDePasseConserverActuel}
        </label>
        <PasswordInput
          id="cf-password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
      </div>

      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}

      <button type="submit" disabled={loading} className="btn btn-primary blueprint relative mt-2 self-start">
        <Corners />
        {loading ? t.enregistrement : t.enregistrerModifications}
      </button>
    </form>
  );
}
