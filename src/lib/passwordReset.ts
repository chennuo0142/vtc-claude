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

export function buildResetUrl(token: string): string {
  const base = (process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/+$/, "");
  return `${base}/reinitialiser-mot-de-passe?token=${encodeURIComponent(token)}`;
}
