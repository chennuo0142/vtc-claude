"use client";

import { LOCALES } from "@/lib/i18n/config";
import { useLanguage } from "@/lib/i18n/context";

export default function LanguageSwitcher() {
  const { locale, setLocale, isPending } = useLanguage();

  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((l) => (
        <button
          key={l.id}
          type="button"
          title={l.label}
          aria-label={l.label}
          onClick={() => setLocale(l.id)}
          disabled={isPending}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[12px] leading-none transition disabled:opacity-50"
          style={{
            border: `1px solid ${locale === l.id ? "var(--color-accent)" : "var(--color-divider)"}`,
            background: locale === l.id ? "var(--color-accent-100)" : "transparent",
          }}
        >
          <span aria-hidden>{l.drapeau}</span>
        </button>
      ))}
    </div>
  );
}
