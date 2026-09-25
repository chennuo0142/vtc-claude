import { prisma } from "@/lib/prisma";
import { generateResetToken, getAppBaseUrl, hashToken } from "@/lib/passwordReset";

export const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export function buildVerificationUrl(token: string): string {
  return `${getAppBaseUrl()}/verifier-email?token=${encodeURIComponent(token)}`;
}

// Génère un nouveau jeton et invalide ceux encore actifs. Retourne le jeton en clair,
// qui ne doit exister que dans l'email envoyé.
export async function issueVerificationToken(userId: string): Promise<string> {
  const token = generateResetToken();
  await prisma.$transaction([
    prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    }),
  ]);
  return token;
}
