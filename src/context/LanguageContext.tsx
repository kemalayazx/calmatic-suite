"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { translations } from "@/i18n/translations";

export type Locale =
  | "en" | "tr" | "de" | "fr" | "es" | "pt" | "it"
  | "nl" | "pl" | "ru" | "ar" | "ja" | "zh" | "ko" | "hi";

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference first
    const saved = localStorage.getItem("calmatic-lang") as Locale | null;
    if (saved && translations[saved]) {
      setLocaleState(saved);
      return;
    }
    // Auto-detect from browser language list (covers most country/language combos)
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const lang of langs) {
      const code = lang.split("-")[0] as Locale;
      if (translations[code]) {
        setLocaleState(code);
        return;
      }
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("calmatic-lang", l);
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  };

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = locale;
      document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
    }
  }, [locale, mounted]);

  const t = (key: string): string => {
    return translations[locale]?.[key] || translations["en"]?.[key] || key;
  };

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  if (!mounted) return <div style={{ visibility: "hidden" }}>{children}</div>;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
