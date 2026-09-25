import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildVCard, vcardFilename } from "@/lib/vcard";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await prisma.user.findFirst({
    where: { id, status: "APPROVED" },
    select: { profile: { select: { nom: true, prenom: true, telephone: true, emailContact: true } } },
  });

  if (!user?.profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const { nom, prenom, telephone, emailContact } = user.profile;

  return new NextResponse(buildVCard({ nom, prenom, telephone, email: emailContact }), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vcardFilename(prenom, nom)}"`,
    },
  });
}
