import { prisma } from "@/lib/prisma";

function randomSixDigits(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function generateNumeroReference(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const candidate = randomSixDigits();
    const existing = await prisma.user.findUnique({
      where: { numeroReference: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("Impossible de générer un numéro de référence unique");
}
