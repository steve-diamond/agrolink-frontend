"use client";

import { useEffect, useState } from "react";
import { getCopy } from "./uiCopy";
import { getStoredLanguage, listenToLanguageChanges, type UiLanguage } from "./uiLanguage";

export function useLocalizedCopy() {
  const [language, setLanguage] = useState<UiLanguage>("en");

  useEffect(() => {
    setLanguage(getStoredLanguage());
    return listenToLanguageChanges(setLanguage);
  }, []);

  return {
    language,
    copy: getCopy(language),
  };
}
