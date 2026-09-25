import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/dictionary";
import { prisma } from "@/lib/prisma";
import ResendVerificationButton from "@/components/ResendVerificationButton";

export default async function CompteEnAttentePage() {
  const session = await auth();

  if (!session) {
    redirect("/connexion");
  }

  if (session.user.status === "APPROVED") {
    redirect("/mon-profil");
  }

  // Relu en base : le jeton de session ne reflète pas la confirmation faite depuis l'email.
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerifiedAt: true },
  });
  const needsEmailVerification = session.user.status === "PENDING" && !dbUser?.emailVerifiedAt;

  const isRejected = session.user.status === "REJECTED";
  const dict = await getDictionary();
  const t = dict.compteEnAttente;

  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-xl font-bold">
        {needsEmailVerification ? t.titreEmailNonConfirme : isRejected ? t.titreRefuse : t.titreEnAttente}
      </h1>
      <p className="mt-2 text-neutral-500">
        {needsEmailVerification ? t.messageEmailNonConfirme : isRejected ? t.messageRefuse : t.messageEnAttente}
      </p>
      {needsEmailVerification && session.user.email && (
        <div className="mt-6">
          <ResendVerificationButton email={session.user.email} />
        </div>
      )}
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
