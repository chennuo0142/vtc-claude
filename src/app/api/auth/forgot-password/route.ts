import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validation";
import { getLocale } from "@/lib/i18n/dictionary";
import { sendPasswordResetEmail } from "@/lib/mail";
import { RESET_TOKEN_TTL_MS, buildResetUrl, generateResetToken, hashToken } from "@/lib/passwordReset";
import { getClientIp, purgeExpiredAuthData, rateLimit } from "@/lib/rateLimit";
import { verifyTurnstile } from "@/lib/turnstile";

const HOUR = 60 * 60 * 1000;

// Réponse strictement identique que le compte existe ou non (anti user-enumeration).
const GENERIC_RESPONSE = { ok: true };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  const { email, turnstileToken } = parsed.data;

  const ip = getClientIp(request);
  if (!(await rateLimit(`forgot:ip:${ip}`, 10, HOUR))) {
    return NextResponse.json({ error: "Trop de demandes, réessayez plus tard" }, { status: 429 });
  }

  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ error: "Vérification anti-robot échouée", code: "antibot" }, { status: 400 });
  }

  // Compté aussi pour les emails inconnus, pour ne rien laisser transparaître.
  const emailAllowed = await rateLimit(`forgot:email:${email.toLowerCase()}`, 3, HOUR);
  if (!emailAllowed) return NextResponse.json(GENERIC_RESPONSE);

  const locale = await getLocale();

  after(async () => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true, email: true, suspended: true },
      });
      if (user && !user.suspended) {
        const token = generateResetToken();
        await prisma.$transaction([
          // Une nouvelle demande invalide les liens précédents encore actifs.
          prisma.passwordResetToken.updateMany({
            where: { userId: user.id, usedAt: null },
            data: { usedAt: new Date() },
          }),
          prisma.passwordResetToken.create({
            data: {
              userId: user.id,
              tokenHash: hashToken(token),
              expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
            },
          }),
        ]);
        await sendPasswordResetEmail(user.email, buildResetUrl(token), locale);
      }
      await purgeExpiredAuthData();
    } catch (error) {
      // Jamais de détail (ni token) dans les logs, et rien ne remonte au client.
      console.error("[forgot-password] échec du traitement", error instanceof Error ? error.message : "erreur inconnue");
    }
  });

  return NextResponse.json(GENERIC_RESPONSE);
}
