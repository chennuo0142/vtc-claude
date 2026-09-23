"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";

export default function DeleteCatalogueButton({
  apiPath,
  confirmMessage,
}: {
  apiPath: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const { dict } = useLanguage();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmMessage)) return;

    setLoading(true);
    const res = await fetch(apiPath, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) return;

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      aria-label={dict.common.supprimer}
      title={dict.common.supprimer}
      className="btn-icon btn-icon-danger"
    >
      <TrashIcon style={{ width: 16, height: 16 }} />
    </button>
  );
}
