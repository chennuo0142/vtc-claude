import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profilSchema, languesSchema, zonesSchema, optionsSchema, modesPaiementSchema } from "@/lib/validation";
import { saveUploadedPhoto, UploadError } from "@/lib/upload";
import type { Prisma } from "@/generated/prisma/client";

const GALERIE_SIZE = 6;

function padGalerie(galerie: string[]): string[] {
  const padded = [...galerie];
  while (padded.length < GALERIE_SIZE) padded.push("");
  return padded.slice(0, GALERIE_SIZE);
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.status !== "APPROVED") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const formData = await request.formData();

  const parsed = profilSchema.safeParse({
    nom: formData.get("nom")?.toString() || undefined,
    prenom: formData.get("prenom")?.toString() || undefined,
    bio: formData.get("bio")?.toString() || undefined,
    telephone: formData.get("telephone")?.toString() || undefined,
    ville: formData.get("ville")?.toString() || undefined,
    codePostal: formData.get("codePostal")?.toString() || undefined,
    vehiculeId: formData.get("vehiculeId")?.toString() || undefined,
    emailContact: formData.get("emailContact")?.toString() || undefined,
    nombrePlaces: formData.get("nombrePlaces")?.toString() || undefined,
    annee: formData.get("annee")?.toString() || undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { nom, prenom, bio, telephone, ville, codePostal, vehiculeId, emailContact, nombrePlaces, annee } =
    parsed.data;

  const languesRaw = formData.get("langues")?.toString();
  let langues: unknown;
  if (languesRaw) {
    try {
      langues = JSON.parse(languesRaw);
    } catch {
      return NextResponse.json({ error: "Langues invalides" }, { status: 400 });
    }
    const parsedLangues = languesSchema.safeParse(langues);
    if (!parsedLangues.success) {
      return NextResponse.json(
        { error: "Langues invalides", issues: parsedLangues.error.issues },
        { status: 400 }
      );
    }
    langues = parsedLangues.data;
  }

  function parseIdList(
    fieldName: string,
    schema: typeof zonesSchema | typeof optionsSchema | typeof modesPaiementSchema
  ): string[] | null {
    const raw = formData.get(fieldName)?.toString();
    if (!raw) return null;
    let value: unknown;
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
    const result = schema.safeParse(value);
    return result.success ? result.data : null;
  }

  const zoneIdsRaw = formData.get("zoneIds")?.toString();
  let zoneIds: string[] | undefined;
  if (zoneIdsRaw) {
    const parsedZoneIds = parseIdList("zoneIds", zonesSchema);
    if (!parsedZoneIds) {
      return NextResponse.json({ error: "Zones invalides" }, { status: 400 });
    }
    zoneIds = parsedZoneIds;
  }

  const optionIdsRaw = formData.get("optionIds")?.toString();
  let optionIds: string[] | undefined;
  if (optionIdsRaw) {
    const parsedOptionIds = parseIdList("optionIds", optionsSchema);
    if (!parsedOptionIds) {
      return NextResponse.json({ error: "Options invalides" }, { status: 400 });
    }
    optionIds = parsedOptionIds;
  }

  const modePaiementIdsRaw = formData.get("modePaiementIds")?.toString();
  let modePaiementIds: string[] | undefined;
  if (modePaiementIdsRaw) {
    const parsedModePaiementIds = parseIdList("modePaiementIds", modesPaiementSchema);
    if (!parsedModePaiementIds) {
      return NextResponse.json({ error: "Modes de paiement invalides" }, { status: 400 });
    }
    modePaiementIds = parsedModePaiementIds;
  }

  try {
    let pendingPhotoUrl = profile.pendingPhotoUrl ?? profile.photoUrl;
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      pendingPhotoUrl = await saveUploadedPhoto(photo);
    }

    let pendingCarteBackgroundUrl =
      profile.pendingCarteBackgroundUrl ?? profile.carteBackgroundUrl;
    const carteBackground = formData.get("carteBackground");
    if (carteBackground instanceof File && carteBackground.size > 0) {
      pendingCarteBackgroundUrl = await saveUploadedPhoto(carteBackground);
    } else if (formData.get("carteBackground_remove") === "on") {
      pendingCarteBackgroundUrl = null;
    }

    const baselineGalerie = padGalerie(
      profile.pendingGalerie.length > 0 ? profile.pendingGalerie : profile.galerie
    );
    const pendingGalerie: string[] = [];
    for (let i = 0; i < GALERIE_SIZE; i++) {
      const file = formData.get(`gallery_${i}`);
      const remove = formData.get(`gallery_remove_${i}`) === "on";
      if (file instanceof File && file.size > 0) {
        pendingGalerie.push(await saveUploadedPhoto(file));
      } else if (remove) {
        pendingGalerie.push("");
      } else {
        pendingGalerie.push(baselineGalerie[i]);
      }
    }

    const updated = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        pendingNom: nom ?? profile.pendingNom ?? profile.nom,
        pendingPrenom: prenom ?? profile.pendingPrenom ?? profile.prenom,
        pendingBio: bio ?? profile.pendingBio ?? profile.bio,
        pendingTelephone: telephone ?? profile.pendingTelephone ?? profile.telephone,
        pendingVille: ville ?? profile.pendingVille ?? profile.ville,
        pendingCodePostal: codePostal ?? profile.pendingCodePostal ?? profile.codePostal,
        pendingVehicule: vehiculeId ? { connect: { id: vehiculeId } } : { disconnect: true },
        pendingEmailContact: emailContact ?? profile.pendingEmailContact ?? profile.emailContact,
        pendingNombrePlaces: nombrePlaces ?? profile.pendingNombrePlaces ?? profile.nombrePlaces,
        pendingAnnee: annee ?? profile.pendingAnnee ?? profile.annee,
        pendingPhotoUrl,
        pendingCarteBackgroundUrl,
        pendingGalerie,
        pendingLangues: (langues ?? profile.pendingLangues ?? profile.langues ?? []) as Prisma.InputJsonValue,
        ...(zoneIds !== undefined && { pendingZones: { set: zoneIds.map((id) => ({ id })) } }),
        ...(optionIds !== undefined && { pendingOptions: { set: optionIds.map((id) => ({ id })) } }),
        ...(modePaiementIds !== undefined && {
          pendingModesPaiement: { set: modePaiementIds.map((id) => ({ id })) },
        }),
        hasPendingChanges: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
