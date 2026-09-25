import { NextResponse, after } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRequestProcessedEmail, toLocale } from "@/lib/mail";
import type { Prisma } from "@/generated/prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id },
    include: {
      pendingZones: true,
      pendingOptions: true,
      pendingModesPaiement: true,
      user: { select: { email: true, locale: true } },
    },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const notifyUser = (approved: boolean) =>
    after(async () => {
      try {
        await sendRequestProcessedEmail(profile.user.email, { kind: "profile", approved }, toLocale(profile.user.locale));
      } catch (error) {
        console.error("[admin/modifications] échec de l'email de traitement", error instanceof Error ? error.message : "erreur inconnue");
      }
    });

  const clearedPending = {
    hasPendingChanges: false,
    pendingNom: null,
    pendingPrenom: null,
    pendingBio: null,
    pendingTelephone: null,
    pendingVille: null,
    pendingCodePostal: null,
    pendingPhotoUrl: null,
    pendingCarteBackgroundUrl: null,
    pendingGalerie: [],
    pendingEmailContact: null,
    pendingLangues: [],
    pendingNombrePlaces: null,
    pendingAnnee: null,
  };

  if (action === "REJECT") {
    const updated = await prisma.profile.update({
      where: { id },
      data: {
        ...clearedPending,
        pendingVehicule: { disconnect: true },
        pendingZones: { set: [] },
        pendingOptions: { set: [] },
        pendingModesPaiement: { set: [] },
      },
    });
    notifyUser(false);
    return NextResponse.json(updated);
  }

  const updated = await prisma.profile.update({
    where: { id },
    data: {
      nom: profile.pendingNom ?? profile.nom,
      prenom: profile.pendingPrenom ?? profile.prenom,
      bio: profile.pendingBio ?? profile.bio,
      telephone: profile.pendingTelephone ?? profile.telephone,
      ville: profile.pendingVille ?? profile.ville,
      codePostal: profile.pendingCodePostal ?? profile.codePostal,
      photoUrl: profile.pendingPhotoUrl ?? profile.photoUrl,
      carteBackgroundUrl: profile.pendingCarteBackgroundUrl ?? profile.carteBackgroundUrl,
      galerie: profile.pendingGalerie.length > 0 ? profile.pendingGalerie : profile.galerie,
      vehicule: profile.pendingVehiculeId
        ? { connect: { id: profile.pendingVehiculeId } }
        : { disconnect: true },
      emailContact: profile.pendingEmailContact ?? profile.emailContact,
      nombrePlaces: profile.pendingNombrePlaces ?? profile.nombrePlaces,
      annee: profile.pendingAnnee ?? profile.annee,
      langues: (profile.pendingLangues ?? profile.langues ?? []) as Prisma.InputJsonValue,
      zones: { set: profile.pendingZones.map((z) => ({ id: z.id })) },
      options: { set: profile.pendingOptions.map((o) => ({ id: o.id })) },
      modesPaiement: { set: profile.pendingModesPaiement.map((m) => ({ id: m.id })) },
      ...clearedPending,
      pendingVehicule: { disconnect: true },
      pendingZones: { set: [] },
      pendingOptions: { set: [] },
      pendingModesPaiement: { set: [] },
    },
  });

  notifyUser(true);
  return NextResponse.json(updated);
}
