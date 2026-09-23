export const LOCALES = [
  { id: "fr", label: "Français", drapeau: "🇫🇷" },
  { id: "en", label: "English", drapeau: "🇬🇧" },
  { id: "zh", label: "中文", drapeau: "🇨🇳" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];

export const DEFAULT_LOCALE: Locale = "fr";

export const LOCALE_COOKIE = "locale";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && LOCALES.some((l) => l.id === value);
}
