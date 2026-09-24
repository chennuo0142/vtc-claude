import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { parseLangues } from "@/lib/langues";
import { getDictionary } from "@/lib/i18n/dictionary";
import MonProfilShell from "./MonProfilShell";

export default async function MonProfilPage() {
  const dict = await getDictionary();
  const session = await auth();
  if (!session) redirect("/connexion");
  if (session.user.status !== "APPROVED") redirect("/compte-en-attente");

  const [profile, vehicules, zones, options, modesPaiement] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { zones: true, options: true, modesPaiement: true },
    }),
    prisma.vehicule.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.zone.findMany({ orderBy: { nom: "asc" } }),
    prisma.option.findMany({ orderBy: { nom: "asc" } }),
    prisma.modePaiement.findMany({ orderBy: { nom: "asc" } }),
  ]);

  if (!profile) redirect("/connexion");

  const messages = await prisma.contactMessage.findMany({
    where: { profileId: profile.id },
    orderBy: { createdAt: "desc" },
  });

  const galerie = [...profile.galerie];
  while (galerie.length < 6) galerie.push("");

  return (
    <MonProfilShell
      userId={session.user.id}
      email={session.user.email ?? ""}
      initiales={`${profile.prenom.charAt(0)}${profile.nom.charAt(0)}`.toUpperCase()}
      hasPendingChanges={profile.hasPendingChanges}
      messages={messages.map((m) => ({
        id: m.id,
        nom: m.nom,
        email: m.email,
        message: m.message,
        date: m.createdAt.toLocaleString("fr-FR"),
      }))}
      formProps={{
        nom: profile.nom,
        prenom: profile.prenom,
        photoUrl: profile.photoUrl,
        carteBackgroundUrl: profile.carteBackgroundUrl,
        bio: profile.bio,
        telephone: profile.telephone,
        ville: profile.ville,
        codePostal: profile.codePostal,
        emailContact: profile.emailContact,
        vehiculeId: profile.vehiculeId,
        nombrePlaces: profile.nombrePlaces,
        annee: profile.annee,
        galerie,
        langues: parseLangues(profile.langues),
        vehicules: vehicules.map((v) => ({
          id: v.id,
          label: `${v.marque} ${v.modele} (${dict.common.categories[v.categorie]})`,
        })),
        zones,
        selectedZoneIds: profile.zones.map((z) => z.id),
        options,
        selectedOptionIds: profile.options.map((o) => o.id),
        modesPaiement,
        selectedModePaiementIds: profile.modesPaiement.map((m) => m.id),
      }}
    />
  );
}
