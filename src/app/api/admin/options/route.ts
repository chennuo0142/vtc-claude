import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { catalogueNomSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const formData = await request.formData();

  const parsed = catalogueNomSchema.safeParse({
    nom: formData.get("nom")?.toString(),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const option = await prisma.option.create({ data: parsed.data });

  return NextResponse.json(option, { status: 201 });
}
