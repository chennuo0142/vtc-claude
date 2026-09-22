import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehiculeSchema } from "@/lib/validation";
import { saveUploadedPhoto, UploadError } from "@/lib/upload";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { id } = await params;

  const formData = await request.formData();

  const parsed = vehiculeSchema.safeParse({
    categorie: formData.get("categorie")?.toString(),
    nombrePlaces: formData.get("nombrePlaces")?.toString(),
    marque: formData.get("marque")?.toString(),
    modele: formData.get("modele")?.toString(),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { categorie, nombrePlaces, marque, modele } = parsed.data;

  const data: {
    categorie: typeof categorie;
    nombrePlaces: number;
    marque: string;
    modele: string;
    photoUrl?: string;
  } = { categorie, nombrePlaces, marque, modele };

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      data.photoUrl = await saveUploadedPhoto(photo);
    } catch (error) {
      if (error instanceof UploadError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  }

  const vehicule = await prisma.vehicule.update({ where: { id }, data });

  return NextResponse.json(vehicule);
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

  await prisma.vehicule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
