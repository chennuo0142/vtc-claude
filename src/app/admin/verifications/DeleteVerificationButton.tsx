"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

export default function DeleteVerificationButton({ id }: { id: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminVerifications;
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(t.confirm)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/verifications/${id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) {
      alert(t.erreur);
      return;
    }
    router.refresh();
  }

  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="btn btn-danger btn-sm">
      <TrashIcon style={{ width: 14, height: 14 }} />
      {t.supprimer}
    </button>
  );
}
