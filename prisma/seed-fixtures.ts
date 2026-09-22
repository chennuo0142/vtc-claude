import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const PRENOMS = [
  "Camille", "Lucas", "Manon", "Hugo", "Chloé", "Nathan", "Léa", "Louis",
  "Emma", "Gabriel", "Sarah", "Jules", "Inès", "Adam", "Zoé", "Raphaël",
  "Jade", "Arthur", "Lina", "Tom", "Louise", "Noah", "Alice", "Ethan",
  "Rose", "Théo", "Anna", "Maxime", "Julie", "Antoine",
];

const NOMS = [
  "Bernard", "Petit", "Durand", "Leroy", "Moreau", "Simon", "Laurent",
  "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux", "Vincent",
  "Fournier", "Morel", "Girard", "André", "Mercier", "Dupuis", "Lambert",
  "Bonnet", "François", "Martinez", "Legrand", "Garnier", "Faure",
  "Rousseau", "Blanc", "Guerin",
];

const VILLES: [string, string][] = [
  ["Paris", "75001"],
  ["Lyon", "69001"],
  ["Marseille", "13001"],
  ["Toulouse", "31000"],
  ["Nice", "06000"],
  ["Nantes", "44000"],
  ["Strasbourg", "67000"],
  ["Montpellier", "34000"],
  ["Bordeaux", "33000"],
  ["Lille", "59000"],
];

const BIOS = [
  "Toujours partant pour de nouvelles rencontres et de bons moments.",
  "Passionné(e) de voyages et de cultures différentes.",
  "Aime les sorties entre amis et la bonne cuisine.",
  "Sportif(ve) dans l'âme, toujours prêt(e) pour une nouvelle aventure.",
  null,
];

function pick<T>(arr: T[], index: number): T {
  return arr[index % arr.length];
}

async function main() {
  const hashedPassword = await bcrypt.hash("fixture123", 10);
  const vehicules = await prisma.vehicule.findMany();

  let created = 0;

  for (let i = 0; i < 30; i++) {
    const prenom = pick(PRENOMS, i);
    const nom = pick(NOMS, i + 7);
    const email = `${prenom.toLowerCase()}.${nom.toLowerCase()}${i}@example.com`;
    const [ville, codePostal] = pick(VILLES, i);
    const bio = pick(BIOS, i);
    const telephone = `06${String(10000000 + i * 137).padStart(8, "0")}`;
    const vehicule = vehicules.length > 0 && i % 3 === 0 ? pick(vehicules, i) : null;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) continue;

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "USER",
        status: "APPROVED",
        profile: {
          create: {
            nom,
            prenom,
            telephone,
            ville,
            codePostal,
            bio,
            vehiculeId: vehicule?.id,
          },
        },
      },
    });
    created++;
  }

  console.log(`${created} profils fixtures créés (mot de passe commun : fixture123).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
