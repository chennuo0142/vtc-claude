import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateNumeroReference } from "@/lib/reference";

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
  const action = body?.action;

  if (action !== "APPROVE" && action !== "REJECT") {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const status = action === "APPROVE" ? "APPROVED" : "REJECTED";

  let numeroReference: string | undefined;
  if (action === "APPROVE") {
    const existing = await prisma.user.findUnique({ where: { id }, select: { numeroReference: true } });
    if (!existing?.numeroReference) {
      numeroReference = await generateNumeroReference();
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: { status, ...(numeroReference ? { numeroReference } : {}) },
  });

  return NextResponse.json({ id: user.id, status: user.status });
}
