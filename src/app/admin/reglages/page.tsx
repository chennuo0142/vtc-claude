import Link from "next/link";
import { getSettings } from "@/lib/settings";
import ReglagesForm from "./ReglagesForm";

export default async function ReglagesPage() {
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-md px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-bold">Réglages</h1>
        <Link href="/admin" className="text-sm text-neutral-500 hover:underline">
          ← Retour aux demandes
        </Link>
      </div>

      <ReglagesForm cardsPerPage={settings.cardsPerPage} />
    </div>
  );
}
