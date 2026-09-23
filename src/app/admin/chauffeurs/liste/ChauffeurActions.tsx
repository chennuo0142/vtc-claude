"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockIcon, CheckIcon } from "@/components/icons";
import { useLanguage } from "@/lib/i18n/context";
import DeleteChauffeurButton from "./DeleteChauffeurButton";

export default function ChauffeurActions({ id, suspended }: { id: string; suspended: boolean }) {
  const router = useRouter();
  const { dict } = useLanguage();
  const t = dict.adminChauffeurs.liste;
  const [loading, setLoading] = useState(false);

  async function toggleSuspend() {
    const action = suspended ? "REACTIVATE" : "SUSPEND";
    if (action === "SUSPEND" && !confirm(t.confirmerSuspension)) return;

    setLoading(true);
    await fetch(`/api/admin/chauffeurs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <>
      <Link href={`/admin/chauffeurs/${id}/modifier`} className="btn btn-secondary btn-sm">
        {t.modifier}
      </Link>
      <button type="button" onClick={toggleSuspend} disabled={loading} className="btn btn-secondary btn-sm">
        {suspended ? <CheckIcon style={{ width: 14, height: 14 }} /> : <LockIcon style={{ width: 14, height: 14 }} />}
        {suspended ? t.reactiver : t.suspendre}
      </button>
      <DeleteChauffeurButton id={id} />
    </>
  );
}
