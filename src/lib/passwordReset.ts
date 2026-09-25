import { createHash, randomBytes } from "node:crypto";

export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

// 256 bits d'entropie, encodés en base64url pour être utilisables dans une URL.
export function generateResetToken(): string {
  return randomBytes(32).toString("base64url");
}

// Seul ce hash est stocké en base : une fuite de la table ne permet pas de forger un lien valide.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

// URL publique fixe : les liens envoyés par email (vérification, mot de passe oublié…) ne doivent jamais pointer vers localhost.
export const APP_BASE_URL = "https://vtc.cosmos-tech.fr";

export function getAppBaseUrl(): string {
  return APP_BASE_URL;
}

export function buildResetUrl(token: string): string {
  return `${getAppBaseUrl()}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;
}
