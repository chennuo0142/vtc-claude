import { NextResponse, after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/passwordReset";
import { notifyAdminsPending } from "@/lib/mail";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const HOUR = 60 * 60 * 1000;

// Message unique : on ne distingue pas jeton inconnu, expiré ou déjà utilisé.
const INVALID_LINK = { error: "Lien invalide ou expiré" };

const verifyEmailSchema = z.object({ token: z.string().min(1).max(200) });

export async function POST(request: Request) {
  if (!(await rateLimit(`verify:ip:${getClientIp(request)}`, 20, HOUR))) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(INVALID_LINK, { status: 400 });

  const tokenHash = hashToken(parsed.data.token);

  const userId = await prisma.$transaction(async (tx) => {
    // Consommation atomique : une seule requête concurrente peut passer de usedAt=null à une date.
    const consumed = await tx.emailVerificationToken.updateMany({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (consumed.count === 0) return null;

    const record = await tx.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });
    if (!record) return null;

    await tx.user.updateMany({
      where: { id: record.userId, emailVerifiedAt: null },
      data: { emailVerifiedAt: new Date() },
    });
    return record.userId;
  });

  if (!userId) return NextResponse.json(INVALID_LINK, { status: 400 });

  // La demande devient visible côté admin : on prévient les administrateurs.
  after(async () => {
    try {
      await notifyAdminsPending();
    } catch (error) {
      console.error("[verify-email] échec de la notification admin", error instanceof Error ? error.message : "erreur inconnue");
    }
  });

  return NextResponse.json({ ok: true });
}
