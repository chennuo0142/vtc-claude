"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteVehiculeButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Supprimer ce véhicule ?")) return;

    setLoading(true);
    const res = await fetch(`/api/admin/vehicules/${id}`, { method: "DELETE" });
    setLoading(false);

    if (!res.ok) return;

    if (redirectTo) {
      router.push(redirectTo);
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Suppression..." : "Supprimer"}
    </button>
  );
}
