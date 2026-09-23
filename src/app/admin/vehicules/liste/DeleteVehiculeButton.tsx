"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

export default function DeleteVehiculeButton({
  id,
  redirectTo,
  variant = "icon",
}: {
  id: string;
  redirectTo?: string;
  variant?: "icon" | "text";
}) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminVehicules.deleteButton;
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(t.confirm)) return;

    setLoading(true);
    const res = await fetch(`/api/admin/vehicules/${id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) return;

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  if (variant === "icon") {
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

  return (
    <button type="button" onClick={handleDelete} disabled={loading} className="btn btn-danger">
      <TrashIcon style={{ width: 15, height: 15 }} />
      {loading ? t.suppression : t.supprimer}
    </button>
  );
}
