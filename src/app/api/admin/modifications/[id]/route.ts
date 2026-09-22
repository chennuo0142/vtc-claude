import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

  const profile = await prisma.profile.findUnique({ where: { id } });
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

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
  };

  if (action === "REJECT") {
    const updated = await prisma.profile.update({
      where: { id },
      data: { ...clearedPending, pendingVehicule: { disconnect: true } },
    });
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
      langues: (profile.pendingLangues ?? profile.langues ?? []) as Prisma.InputJsonValue,
      ...clearedPending,
      pendingVehicule: { disconnect: true },
    },
  });

  return NextResponse.json(updated);
}
