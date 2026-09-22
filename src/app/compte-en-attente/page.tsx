import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CompteEnAttentePage() {
  const session = await auth();

  if (!session) {
    redirect("/connexion");
  }

  if (session.user.status === "APPROVED") {
    redirect("/mon-profil");
  }

  const isRejected = session.user.status === "REJECTED";

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-xl font-bold">
        {isRejected ? "Demande refusée" : "Compte en attente de validation"}
      </h1>
      <p className="mt-2 text-neutral-500">
        {isRejected
          ? "Votre demande d'inscription a été refusée par un administrateur."
          : "Votre demande est en cours d'examen par un administrateur. Vous serez notifié dès qu'elle sera validée."}
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
          Se déconnecter
        </button>
      </form>
    </div>
  );
}
