import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function CompteEnAttentePage() {
  const session = await auth();

  if (!session) {
    redirect("/connexion");
  }

  if (session.user.status === "APPROVED") {
    redirect("/mon-profil");
  }

  const isRejected = session.user.status === "REJECTED";
  const dict = await getDictionary();
  const t = dict.compteEnAttente;

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-xl font-bold">
        {isRejected ? t.titreRefuse : t.titreEnAttente}
      </h1>
      <p className="mt-2 text-neutral-500">
        {isRejected ? t.messageRefuse : t.messageEnAttente}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="mt-6 rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
        >
          {t.seDeconnecter}
        </button>
      </form>
    </div>
  );
}
