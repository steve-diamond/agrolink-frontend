"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Language, SUPPORTED_LANGUAGES, UI_COPY } from "@/lib/i18n";
import API from "@/lib/api";
import { AuthUser, clearSession, getStoredToken, getStoredUser, saveSession } from "@/lib/clientAuth";

type AppShellContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  user: AuthUser | null;
  token: string | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const AppShellContext = createContext<AppShellContextValue>({
  language: "en",
  setLanguage: () => {},
  user: null,
  token: null,
  setSession: () => {},
  logout: () => {},
});

export function useAppShell() {
  return useContext(AppShellContext);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    if (!token) {
      return;
    }

    API.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        const liveUser = response.data?.data?.user || response.data?.user;
        if (liveUser) {
          saveSession(token, liveUser);
          setUser(liveUser);
        }
      })
      .catch(() => {
        clearSession();
        setUser(null);
        setToken(null);
      });
  }, [token]);

  const setSession = (nextToken: string, nextUser: AuthUser) => {
    saveSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ language, setLanguage, user, token, setSession, logout }),
    [language, user, token]
  );
  const copy = UI_COPY[language];

  return (
    <AppShellContext.Provider value={value}>
      <div className="shell">
        <nav className="shellNav card">
          <div className="shellBrand">
            <Image src="/dos-logo.jpg" alt="Dos AgroLink logo" width={44} height={44} className="brandLogo" />
            <div>
              <p className="brandOverline">{copy.tagline}</p>
              <strong>{copy.appName}</strong>
            </div>
          </div>

          <div className="shellLinks">
            <Link href="/">{copy.home}</Link>
            <Link href="/market-hub">{copy.marketHub}</Link>
            <Link href="/input-shop">{copy.inputShop}</Link>
            <Link href="/my-farm">{copy.myFarm}</Link>
            <Link href="/financial-services">{copy.finance}</Link>
          </div>

          <div className="shellAuth">
            {user ? (
              <>
                <span className="userChip">{user.name} · {user.role}</span>
                <button type="button" className="authButton" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="authLink">Login</Link>
                <Link href="/register" className="authLink authLinkAccent">Register</Link>
              </>
            )}
          </div>

          <select
            className="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
            aria-label="Choose language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
        </nav>

        {children}
      </div>
    </AppShellContext.Provider>
  );
}
