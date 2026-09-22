"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  codePostal: string;
};

export default function AdminDemandeRow({ id, email, nom, prenom, telephone, ville, codePostal }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  async function handleAction(action: "APPROVE" | "REJECT") {
    setLoading(action);
    await fetch(`/api/admin/demandes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium">
          {prenom} {nom}
        </p>
        <p className="text-sm text-neutral-500">{email}</p>
        <p className="text-sm text-neutral-500">
          {telephone} · {ville} {codePostal}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleAction("APPROVE")}
          disabled={loading !== null}
          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          {loading === "APPROVE" ? "..." : "Approuver"}
        </button>
        <button
          onClick={() => handleAction("REJECT")}
          disabled={loading !== null}
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {loading === "REJECT" ? "..." : "Rejeter"}
        </button>
      </div>
    </div>
  );
}
