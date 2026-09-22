import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export async function getSettings() {
  const existing = await prisma.appSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;

  try {
    return await prisma.appSettings.create({ data: { id: SETTINGS_ID } });
  } catch {
    // Une autre requête concurrente vient de créer la ligne : on la relit.
    return prisma.appSettings.findUniqueOrThrow({ where: { id: SETTINGS_ID } });
  }
}

export async function updateSettings(data: { cardsPerPage: number }) {
  return prisma.appSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}
