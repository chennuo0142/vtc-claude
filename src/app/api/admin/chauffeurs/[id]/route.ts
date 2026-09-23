import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chauffeurAdminSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (body?.action === "SUSPEND" || body?.action === "REACTIVATE") {
    const user = await prisma.user.update({
      where: { id },
      data: { suspended: body.action === "SUSPEND" },
    });
    return NextResponse.json({ id: user.id, suspended: user.suspended });
  }

  const parsed = chauffeurAdminSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { email, nom, prenom, telephone, ville, codePostal, password } = parsed.data;

  const data: { email: string; password?: string; profile: { update: object } } = {
    email,
    profile: { update: { nom, prenom, telephone, ville, codePostal } },
  };

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    include: { profile: true },
  });

  return NextResponse.json(user);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
