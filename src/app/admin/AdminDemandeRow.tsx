"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminRow from "@/components/admin/AdminRow";
import InitialsAvatar from "@/components/admin/InitialsAvatar";
import { CheckIcon, XIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

type Props = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string;
  ville: string;
  codePostal: string;
  last?: boolean;
};

export default function AdminDemandeRow({ id, email, nom, prenom, telephone, ville, codePostal, last }: Props) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminDashboard;
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
    <AdminRow
      last={last}
      leading={<InitialsAvatar initials={`${prenom[0] ?? ""}${nom[0] ?? ""}`} />}
      title={`${prenom} ${nom}`}
      subtitle={email}
      meta={`${telephone} · ${ville} ${codePostal}`}
      actions={
        <>
          <button
            onClick={() => handleAction("APPROVE")}
            disabled={loading !== null}
            className="btn btn-primary btn-sm"
          >
            <CheckIcon style={{ width: 14, height: 14 }} />
            {loading === "APPROVE" ? "..." : t.approuver}
          </button>
          <button
            onClick={() => handleAction("REJECT")}
            disabled={loading !== null}
            className="btn btn-danger btn-sm"
          >
            <XIcon style={{ width: 14, height: 14 }} />
            {loading === "REJECT" ? "..." : t.rejeter}
          </button>
        </>
      }
    />
  );
}
