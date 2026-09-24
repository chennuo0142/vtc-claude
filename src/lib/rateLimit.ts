import { prisma } from "@/lib/prisma";

// Limitation de débit à fenêtre glissante, stockée en base (fonctionne avec plusieurs
// processus et survit aux redémarrages PM2). Retourne true si l'action est autorisée.
export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs);
  const count = await prisma.rateLimitHit.count({ where: { key, createdAt: { gt: since } } });
  if (count >= max) return false;
  await prisma.rateLimitHit.create({ data: { key } });
  return true;
}

// Purge opportuniste : évite d'avoir besoin d'un cron.
export async function purgeExpiredAuthData(): Promise<void> {
  const now = Date.now();
  await Promise.all([
    prisma.rateLimitHit.deleteMany({ where: { createdAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } }),
    prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date(now - 24 * 60 * 60 * 1000) } } }),
  ]);
}

// nginx pose X-Real-IP à partir de l'adresse TCP réelle ; X-Forwarded-For peut contenir une
// valeur fournie par le client en tête de liste, on ne s'y fie donc qu'en dernier recours.
export function getClientIp(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").at(-1)!.trim();
  return "unknown";
}
