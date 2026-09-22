import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactMessageSchema } from "@/lib/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, status: "APPROVED" },
    include: { profile: true },
  });

  if (!user || !user.profile) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  await prisma.contactMessage.create({
    data: {
      ...parsed.data,
      profileId: user.profile.id,
    },
  });

  return NextResponse.json({ message: "Message envoyé" }, { status: 201 });
}
