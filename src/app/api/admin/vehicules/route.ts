import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehiculeSchema } from "@/lib/validation";
import { saveUploadedPhoto, UploadError } from "@/lib/upload";

export async function POST(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

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

  let photoUrl: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      photoUrl = await saveUploadedPhoto(photo);
    } catch (error) {
      if (error instanceof UploadError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
  }

  const vehicule = await prisma.vehicule.create({
    data: { categorie, nombrePlaces, marque, modele, photoUrl },
  });

  return NextResponse.json(vehicule, { status: 201 });
}
