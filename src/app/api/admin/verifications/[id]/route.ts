import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Supprime une demande dont l'email n'a jamais été confirmé (profil et jetons partent en cascade),
// ce qui libère l'adresse et permet à la personne de refaire une inscription.
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  // Le filtre garantit qu'on ne supprime jamais un compte vérifié, traité ou admin.
  const { count } = await prisma.user.deleteMany({
    where: { id, role: "USER", status: "PENDING", emailVerifiedAt: null },
  });

  if (count === 0) {
    return NextResponse.json({ error: "Demande introuvable ou déjà vérifiée" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
