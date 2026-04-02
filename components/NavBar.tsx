"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import dosLogo from "../dos logo.jpg";
import { emitLanguageChanged, getStoredLanguage, setStoredLanguage, type UiLanguage } from "@/services/uiLanguage";
import { getPendingQueueCount, listenToOfflineQueueChanges } from "@/services/offlineQueue";
import { getCopy } from "@/services/uiCopy";

type AuthUser = {
  name: string;
  role: "farmer" | "buyer" | "admin";
};

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [language, setLanguage] = useState<UiLanguage>("en");
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Re-read user state whenever the route changes so nav reacts to login/logout.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      setUser(raw ? JSON.parse(raw) : null);
    } catch {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    setPendingQueueCount(getPendingQueueCount());
    setIsOnline(typeof navigator === "undefined" ? true : navigator.onLine);

    const detachQueueListener = listenToOfflineQueueChanges(() => {
      setPendingQueueCount(getPendingQueueCount());
    });

    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      detachQueueListener();
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const copy = getCopy(language);

  const handleLanguageChange = (value: UiLanguage) => {
    setLanguage(value);
    setStoredLanguage(value);
    emitLanguageChanged();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  const linkBase = "touch-target rounded-lg px-2.5 py-2 text-sm font-semibold text-emerald-50 transition hover:bg-white/10";
  const accentLink = `${linkBase} text-amber-100`;
  const adminLink = `${linkBase} text-amber-200`;

  return (
    <nav className="flex flex-wrap items-center gap-3 border-b-2 border-amber-500 bg-gradient-to-r from-green-950 via-green-900 to-green-800 px-4 py-2 text-white">
      <Link
        href="/"
        className="touch-target mr-1 flex items-center gap-2 text-base font-extrabold tracking-tight"
      >
        <Image
          src={dosLogo}
          alt="Dos AgroLink logo"
          width={42}
          height={42}
          className="rounded-lg border border-white/55"
        />
        <span>Dos AgroLink</span>
      </Link>

      <Link href="/marketplace" className={linkBase}>Marketplace</Link>

      {user ? (
        <>
          <Link href="/dashboard" className={linkBase}>Dashboard</Link>

          {user.role === "farmer" && (
            <Link href="/farmer/upload" className={accentLink}>Upload Product</Link>
          )}

          {user.role === "buyer" && (
            <Link href="/orders" className={linkBase}>My Orders</Link>
          )}

          {user.role === "admin" && (
            <Link href="/admin" className={adminLink}>Admin Panel</Link>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-xs text-green-50">
              {copy.syncStatus}: {isOnline ? copy.online : copy.offline} · {copy.queued} {pendingQueueCount}
            </span>
            <label htmlFor="language" className="text-xs text-green-100">Language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as UiLanguage)}
              className="min-h-10 rounded-lg border border-white/35 bg-white/10 px-2 text-sm text-green-50"
            >
              <option value="en">English</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
              <option value="pcm">Pidgin</option>
            </select>
          </div>

          <span className="text-xs text-green-100">
            {user.name} · {user.role}
          </span>

          <button
            onClick={handleLogout}
            className="touch-target rounded-lg border border-white/35 px-3 py-2 text-sm text-slate-100 transition hover:bg-white/10"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <div className="ml-auto flex items-center gap-3">
            <span className="rounded-full border border-white/25 bg-white/10 px-2 py-1 text-xs text-green-50">
              {copy.syncStatus}: {isOnline ? copy.online : copy.offline} · {copy.queued} {pendingQueueCount}
            </span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as UiLanguage)}
              aria-label="Choose language"
              className="min-h-10 rounded-lg border border-white/35 bg-white/10 px-2 text-sm text-green-50"
            >
              <option value="en">EN</option>
              <option value="ha">HA</option>
              <option value="yo">YO</option>
              <option value="ig">IG</option>
              <option value="pcm">PC</option>
            </select>
            <Link href="/login" className={linkBase}>Login</Link>
            <Link href="/register" className={`${accentLink} border border-amber-400`}>
              Register
            </Link>
            <Link href="/admin/login" className={adminLink}>Admin</Link>
          </div>
        </>
      )}
    </nav>
  );
}
