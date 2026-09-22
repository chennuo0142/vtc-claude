"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModificationActions({ id }: { id: string }) {
  const router = useRouter();
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
      <button
        onClick={() => handleAction("APPROVE")}
        disabled={loading !== null}
        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading === "APPROVE" ? "..." : "Approuver"}
      </button>
      <button
        onClick={() => handleAction("REJECT")}
        disabled={loading !== null}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading === "REJECT" ? "..." : "Rejeter"}
      </button>
    </div>
  );
}
