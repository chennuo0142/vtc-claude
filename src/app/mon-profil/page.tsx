import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CATEGORIE_LABELS } from "@/lib/vehicule";
import { parseLangues } from "@/lib/langues";
import MonProfilForm from "./MonProfilForm";

export default async function MonProfilPage() {
  const session = await auth();
  if (!session) redirect("/connexion");
  if (session.user.status !== "APPROVED") redirect("/compte-en-attente");

  const [profile, vehicules] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.user.id } }),
    prisma.vehicule.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!profile) redirect("/connexion");

  const messages = await prisma.contactMessage.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  const galerie = [...profile.galerie];
  while (galerie.length < 6) galerie.push("");

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <div className="kicker">Espace chauffeur</div>
        <h1 style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-0.02em" }}>Mon profil</h1>
      </div>

      {profile.hasPendingChanges && (
        <p
          className="border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
        >
          Vos dernières modifications sont en attente de validation par un administrateur. Le
          profil visible publiquement reste celui affiché ci-dessous jusqu&apos;à validation.
        </p>
      )}

      <MonProfilForm
        nom={profile.nom}
        prenom={profile.prenom}
        photoUrl={profile.photoUrl}
        carteBackgroundUrl={profile.carteBackgroundUrl}
        bio={profile.bio}
        telephone={profile.telephone}
        ville={profile.ville}
        codePostal={profile.codePostal}
        emailContact={profile.emailContact}
        vehiculeId={profile.vehiculeId}
        galerie={galerie}
        langues={parseLangues(profile.langues)}
        vehicules={vehicules.map((v) => ({
          id: v.id,
          label: `${v.marque} ${v.modele} (${CATEGORIE_LABELS[v.categorie]})`,
        }))}
      />

      <div className="mt-4 flex flex-col gap-4 border-t pt-6" style={{ borderColor: "var(--color-divider)" }}>
        <h2 style={{ fontSize: 22 }}>Messages reçus</h2>
        {messages.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
            Aucun message pour le moment.
          </p>
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-divider)" }}>
            {messages.map((message) => (
              <div key={message.id} className="py-4" style={{ borderColor: "var(--color-divider)" }}>
                <p className="text-[13px]" style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                  {message.nom}{" "}
                  <span style={{ fontWeight: 400, color: "var(--color-neutral-700)" }}>{message.email}</span>
                </p>
                <p
                  className="mt-1.5 whitespace-pre-line text-[14px] leading-[1.5]"
                  style={{ color: "var(--color-neutral-900)" }}
                >
                  {message.message}
                </p>
                <p className="mt-1.5 text-[11px]" style={{ color: "var(--color-neutral-500)" }}>
                  {message.createdAt.toLocaleString("fr-FR")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
