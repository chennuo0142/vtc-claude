import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { inscriptionSchema } from "@/lib/validation";

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

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      profile: {
        create: { nom, prenom, telephone, ville, codePostal },
      },
    },
  });

  return NextResponse.json(
    { message: "Demande d'inscription envoyée, en attente de validation" },
    { status: 201 }
  );
}
