"use client";

export type UiLanguage = "en" | "ha" | "yo" | "ig" | "pcm";

const STORAGE_KEY = "uiLanguage";

export const SUPPORTED_LANGUAGES: UiLanguage[] = ["en", "ha", "yo", "ig", "pcm"];

export function getStoredLanguage(): UiLanguage {
  if (typeof window === "undefined") {
    return "en";
  }

  const saved = window.localStorage.getItem(STORAGE_KEY) as UiLanguage | null;
  return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : "en";
}

export function setStoredLanguage(language: UiLanguage) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, language);
}

export function listenToLanguageChanges(onChange: (language: UiLanguage) => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const listener = () => onChange(getStoredLanguage());
  window.addEventListener("storage", listener);
  window.addEventListener("agrolink-language-changed", listener as EventListener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("agrolink-language-changed", listener as EventListener);
  };
}

export function emitLanguageChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event("agrolink-language-changed"));
}
