import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { parseLangues } from "@/lib/langues";
import { getDictionary } from "@/lib/i18n/dictionary";
import MonProfilForm from "./MonProfilForm";
import ChangerMotDePasseForm from "./ChangerMotDePasseForm";

export default async function MonProfilPage() {
  const dict = await getDictionary();
  const t = dict.monProfilPage;
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
    <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <div className="kicker">{t.kicker}</div>
        <h1 style={{ fontSize: 34, lineHeight: 1, letterSpacing: "-0.02em" }}>{t.titre}</h1>
      </div>

      {profile.hasPendingChanges && (
        <p
          className="border px-4 py-3 text-sm"
          style={{ borderColor: "var(--color-accent)", color: "var(--color-accent-800)", background: "var(--color-accent-100)" }}
        >
          {t.modificationsEnAttente}
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
        nombrePlaces={profile.nombrePlaces}
        annee={profile.annee}
        galerie={galerie}
        langues={parseLangues(profile.langues)}
        vehicules={vehicules.map((v) => ({
          id: v.id,
          label: `${v.marque} ${v.modele} (${dict.common.categories[v.categorie]})`,
        }))}
        zones={zones}
        selectedZoneIds={profile.zones.map((z) => z.id)}
        options={options}
        selectedOptionIds={profile.options.map((o) => o.id)}
        modesPaiement={modesPaiement}
        selectedModePaiementIds={profile.modesPaiement.map((m) => m.id)}
      />

      <ChangerMotDePasseForm />

      <div className="mt-4 flex flex-col gap-4 border-t pt-6" style={{ borderColor: "var(--color-divider)" }}>
        <h2 style={{ fontSize: 22 }}>{t.messagesRecus}</h2>
        {messages.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-neutral-700)" }}>
            {t.aucunMessage}
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
