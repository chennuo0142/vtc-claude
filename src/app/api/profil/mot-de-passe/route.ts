import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { motDePasseSchema } from "@/lib/validation";
import { sendPasswordChangedEmail, toLocale } from "@/lib/mail";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = motDePasseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { motDePasseActuel, nouveauMotDePasse } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const valid = await bcrypt.compare(motDePasseActuel, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(nouveauMotDePasse, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  after(async () => {
    try {
      await sendPasswordChangedEmail(user.email, toLocale(user.locale));
    } catch (error) {
      console.error("[mot-de-passe] échec de l'alerte email", error instanceof Error ? error.message : "erreur inconnue");
    }
  });

  return NextResponse.json({ ok: true });
}
