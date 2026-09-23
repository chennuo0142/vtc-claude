"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setLocale as setLocaleAction } from "./actions";
import type { Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

type LanguageContextValue = {
  locale: Locale;
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
  isPending: boolean;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Only `locale` (a plain string) crosses the server -> client boundary as a prop.
 * The dictionary itself is picked from a client-bundled copy of `dictionaries`,
 * because several dictionary values are functions (pluralization/interpolation),
 * and functions can't be passed as props from a Server Component.
 */
export function LanguageProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const dict = dictionaries[locale];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  return (
    <LanguageContext.Provider value={{ locale, dict, setLocale, isPending }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
