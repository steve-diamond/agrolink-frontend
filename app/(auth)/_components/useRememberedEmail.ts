import { useEffect, useState } from "react";

export default function useRememberedEmail(storageKey: string) {
  const [rememberEmail, setRememberEmail] = useState(false);
  const [rememberedEmail, setRememberedEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem(storageKey);
    if (savedEmail) {
      setRememberedEmail(savedEmail);
      setRememberEmail(true);
    }
  }, [storageKey]);

  const persistRememberedEmail = (email: string) => {
    if (rememberEmail) {
      localStorage.setItem(storageKey, email.trim().toLowerCase());
      return;
    }

    localStorage.removeItem(storageKey);
  };

  return {
    rememberEmail,
    setRememberEmail,
    rememberedEmail,
    persistRememberedEmail,
  };
}
