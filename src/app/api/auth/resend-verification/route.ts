import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { resendVerificationSchema } from "@/lib/validation";
import { getLocale } from "@/lib/i18n/dictionary";
import { sendEmailVerificationEmail } from "@/lib/mail";
import { buildVerificationUrl, issueVerificationToken } from "@/lib/emailVerification";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const HOUR = 60 * 60 * 1000;

// Réponse strictement identique que le compte existe ou non, qu'il soit déjà vérifié ou non (anti user-enumeration).
const GENERIC_RESPONSE = { ok: true };

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = resendVerificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }
  const { email } = parsed.data;

  if (!(await rateLimit(`resend-verif:ip:${getClientIp(request)}`, 10, HOUR))) {
    return NextResponse.json({ error: "Trop de demandes, réessayez plus tard" }, { status: 429 });
  }

  // Compté aussi pour les emails inconnus, pour ne rien laisser transparaître.
  const emailAllowed = await rateLimit(`resend-verif:email:${email.toLowerCase()}`, 3, HOUR);
  if (!emailAllowed) return NextResponse.json(GENERIC_RESPONSE);

  const locale = await getLocale();

  after(async () => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
        select: { id: true, email: true, suspended: true, emailVerifiedAt: true },
      });
      if (user && !user.suspended && !user.emailVerifiedAt) {
        const token = await issueVerificationToken(user.id);
        await sendEmailVerificationEmail(user.email, buildVerificationUrl(token), locale);
      }
    } catch (error) {
      // Jamais de détail (ni token) dans les logs, et rien ne remonte au client.
      console.error("[resend-verification] échec du traitement", error instanceof Error ? error.message : "erreur inconnue");
    }
  });

  return NextResponse.json(GENERIC_RESPONSE);
}
