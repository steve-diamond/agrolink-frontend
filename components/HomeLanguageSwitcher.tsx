"use client";

import { useEffect, useState } from "react";
import { emitLanguageChanged, getStoredLanguage, setStoredLanguage, type UiLanguage } from "@/services/uiLanguage";

const options: Array<{ label: string; value: UiLanguage }> = [
  { label: "EN", value: "en" },
  { label: "YO", value: "yo" },
  { label: "IG", value: "ig" },
  { label: "HA", value: "ha" },
];

export default function HomeLanguageSwitcher() {
  const [language, setLanguage] = useState<UiLanguage>("en");

  useEffect(() => {
    setLanguage(getStoredLanguage());
  }, []);

  const handleChange = (value: UiLanguage) => {
    setLanguage(value);
    setStoredLanguage(value);
    emitLanguageChanged();
  };

  return (
    <div className="dos-language-switch" role="group" aria-label="Change language">
      {options.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => handleChange(item.value)}
          className={`dos-lang-chip ${language === item.value ? "is-active" : ""}`}
          aria-pressed={language === item.value}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
