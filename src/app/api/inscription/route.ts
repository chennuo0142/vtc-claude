import { NextResponse, after } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { inscriptionSchema } from "@/lib/validation";
import { getLocale } from "@/lib/i18n/dictionary";
import { sendEmailVerificationEmail } from "@/lib/mail";
import { buildVerificationUrl, issueVerificationToken } from "@/lib/emailVerification";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = inscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { nom, prenom, email, telephone, ville, codePostal, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Un compte existe déjà avec cet email" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const locale = await getLocale();

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      locale,
      profile: {
        create: { nom, prenom, telephone, ville, codePostal },
      },
    },
  });

  // Les admins ne sont prévenus qu'une fois l'email confirmé (voir /api/auth/verify-email).
  after(async () => {
    try {
      const token = await issueVerificationToken(user.id);
      await sendEmailVerificationEmail(user.email, buildVerificationUrl(token), locale);
    } catch (error) {
      console.error("[inscription] échec de l'email de confirmation", error instanceof Error ? error.message : "erreur inconnue");
    }
  });

  return NextResponse.json(
    { message: "Demande d'inscription envoyée, confirmez votre adresse email" },
    { status: 201 }
  );
}
