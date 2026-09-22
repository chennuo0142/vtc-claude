import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { settingsSchema } from "@/lib/validation";
import { updateSettings } from "@/lib/settings";

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Champs invalides", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const settings = await updateSettings(parsed.data);

  return NextResponse.json(settings);
}
