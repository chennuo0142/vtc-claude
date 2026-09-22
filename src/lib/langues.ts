export const LANGUE_OPTIONS = [
  { code: "ZH", label: "Chinois", drapeau: "🇨🇳" },
  { code: "FR", label: "Français", drapeau: "🇫🇷" },
  { code: "EN", label: "Anglais", drapeau: "🇬🇧" },
  { code: "AUTRE", label: "Autre", drapeau: "🌐" },
] as const;

export type LangueCode = (typeof LANGUE_OPTIONS)[number]["code"];

export type LangueEntry = {
  code: LangueCode;
  label?: string;
  niveau: 1 | 2 | 3;
};

export function formatLangue(entry: LangueEntry): { drapeau: string; libelle: string } {
  const option = LANGUE_OPTIONS.find((o) => o.code === entry.code);
  if (entry.code === "AUTRE") {
    return { drapeau: option?.drapeau ?? "🌐", libelle: entry.label?.trim() || "Autre" };
  }
  return { drapeau: option?.drapeau ?? "🌐", libelle: option?.label ?? entry.code };
}

export function parseLangues(value: unknown): LangueEntry[] {
  if (!Array.isArray(value)) return [];
  return value as LangueEntry[];
}
