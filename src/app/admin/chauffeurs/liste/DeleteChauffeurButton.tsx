"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

export default function DeleteChauffeurButton({ id }: { id: string }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminChauffeurs.deleteButton;
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(t.confirm)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/chauffeurs/${id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) return;

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label={t.supprimer}
      title={t.supprimer}
      className="btn-icon btn-icon-danger"
    >
      <TrashIcon style={{ width: 16, height: 16 }} />
    </button>
  );
}
