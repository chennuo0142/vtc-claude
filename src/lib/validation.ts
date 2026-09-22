import { z } from "zod";

export const inscriptionSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100),
  prenom: z.string().trim().min(1, "Le prénom est requis").max(100),
  email: z.email("Email invalide"),
  telephone: z
    .string()
    .trim()
    .regex(/^[0-9+ .()-]{6,20}$/, "Numéro de téléphone invalide"),
  ville: z.string().trim().min(1, "La ville est requise").max(100),
  codePostal: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, "Code postal invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export const profilSchema = z.object({
  nom: z.string().trim().min(1).max(100).optional(),
  prenom: z.string().trim().min(1).max(100).optional(),
  bio: z.string().trim().max(2000).optional(),
  telephone: z
    .string()
    .trim()
    .regex(/^[0-9+ .()-]{6,20}$/, "Numéro de téléphone invalide")
    .optional(),
  ville: z.string().trim().min(1).max(100).optional(),
  codePostal: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/, "Code postal invalide")
    .optional(),
  vehiculeId: z.string().trim().optional(),
  emailContact: z.email("Email invalide").optional(),
});

export const langueEntrySchema = z
  .object({
    code: z.enum(["ZH", "FR", "EN", "AUTRE"]),
    label: z.string().trim().max(50).optional(),
    niveau: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  })
  .refine((v) => v.code !== "AUTRE" || (v.label && v.label.length > 0), {
    message: "Le nom de la langue est requis",
    path: ["label"],
  });

export const languesSchema = z.array(langueEntrySchema).max(3, "3 langues maximum");

export const contactMessageSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100),
  email: z.email("Email invalide"),
  message: z.string().trim().min(1, "Le message est requis").max(2000),
});

export const settingsSchema = z.object({
  cardsPerPage: z.coerce.number().int().min(1, "Minimum 1 carte par page").max(100, "Maximum 100 cartes par page"),
});

export const vehiculeSchema = z.object({
  categorie: z.enum(["BERLINE", "VAN", "SUV"], "Catégorie invalide"),
  nombrePlaces: z.coerce.number().int().min(1, "Le nombre de places doit être positif").max(50),
  marque: z.string().trim().min(1, "La marque est requise").max(100),
  modele: z.string().trim().min(1, "Le modèle est requis").max(100),
});
