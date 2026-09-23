import type { Prisma } from "@/generated/prisma/client";
import { LANGUE_OPTIONS, parseLangues, type LangueCode } from "@/lib/langues";

export type ProfilFiltres = {
  langue?: LangueCode;
  ville?: string;
  modele?: string;
  placesMin?: number;
};

export function parseFiltresFromSearchParams(
  sp: Record<string, string | undefined>
): ProfilFiltres {
  const langueRaw = sp.langue;
  const langue = LANGUE_OPTIONS.some((o) => o.code === langueRaw)
    ? (langueRaw as LangueCode)
    : undefined;

  const ville = sp.ville?.trim() || undefined;
  const modele = sp.modele?.trim() || undefined;

  const placesMinRaw = sp.places ? parseInt(sp.places, 10) : NaN;
  const placesMin =
    Number.isFinite(placesMinRaw) && placesMinRaw > 0 ? placesMinRaw : undefined;

  return { langue, ville, modele, placesMin };
}

export function buildProfilWhere(filtres: ProfilFiltres): Prisma.UserWhereInput {
  const profileWhere: Prisma.ProfileWhereInput = {};

  if (filtres.ville) {
    profileWhere.ville = { contains: filtres.ville, mode: "insensitive" };
  }

  if (filtres.modele || filtres.placesMin) {
    profileWhere.vehicule = {
      ...(filtres.modele ? { modele: { contains: filtres.modele, mode: "insensitive" } } : {}),
      ...(filtres.placesMin ? { nombrePlaces: { gte: filtres.placesMin } } : {}),
    };
  }

  return {
    status: "APPROVED",
    suspended: false,
    profile: { isNot: null, is: profileWhere },
  };
}

export function matchesLangue(langues: unknown, langue: LangueCode): boolean {
  return parseLangues(langues).some((l) => l.code === langue);
}
