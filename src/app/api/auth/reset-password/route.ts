import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validation";
import { hashToken } from "@/lib/passwordReset";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const HOUR = 60 * 60 * 1000;

// Message unique : on ne distingue pas jeton inconnu, expiré ou déjà utilisé.
const INVALID_LINK = { error: "Lien invalide ou expiré" };

export async function POST(request: Request) {
  if (!(await rateLimit(`reset:ip:${getClientIp(request)}`, 20, HOUR))) {
    return NextResponse.json({ error: "Trop de tentatives, réessayez plus tard" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { token, nouveauMotDePasse } = parsed.data;
  const tokenHash = hashToken(token);
  const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);

  const userId = await prisma.$transaction(async (tx) => {
    // Consommation atomique : une seule requête concurrente peut passer de usedAt=null à une date.
    const consumed = await tx.passwordResetToken.updateMany({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (consumed.count === 0) return null;

    const record = await tx.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { userId: true },
    });
    if (!record) return null;

    await tx.user.update({ where: { id: record.userId }, data: { password: hashedPassword } });
    // Tous les autres liens en cours pour ce compte deviennent inutilisables.
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });
    return record.userId;
  });

  if (!userId) return NextResponse.json(INVALID_LINK, { status: 400 });

  return NextResponse.json({ ok: true });
}
