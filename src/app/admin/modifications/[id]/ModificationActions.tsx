"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, XIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

export default function ModificationActions({ id }: { id: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminModificationDetail.actions;
  const [loading, setLoading] = useState<"APPROVE" | "REJECT" | null>(null);

  async function handleAction(action: "APPROVE" | "REJECT") {
    setLoading(action);
    await fetch(`/api/admin/modifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.push("/admin/modifications");
    router.refresh();
  }

  return (
    <div className="mt-6 flex gap-3">
      <button onClick={() => handleAction("APPROVE")} disabled={loading !== null} className="btn btn-primary">
        <CheckIcon style={{ width: 15, height: 15 }} />
        {loading === "APPROVE" ? "..." : t.approuver}
      </button>
      <button onClick={() => handleAction("REJECT")} disabled={loading !== null} className="btn btn-danger">
        <XIcon style={{ width: 15, height: 15 }} />
        {loading === "REJECT" ? "..." : t.rejeter}
      </button>
    </div>
  );
}
