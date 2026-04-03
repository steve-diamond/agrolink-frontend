"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import dosLogo from "../dos logo.jpg";
import { emitLanguageChanged, getStoredLanguage, setStoredLanguage, type UiLanguage } from "@/services/uiLanguage";
import { getPendingQueueCount, listenToOfflineQueueChanges } from "@/services/offlineQueue";
import { getCopy } from "@/services/uiCopy";
import { isRouteActive } from "@/lib/navigationActive";

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

  const topBarLinks = [
    { href: "/marketplace", label: "Marketplace" },
    { href: "/product-listing", label: "Product Listing" },
    { href: "/loan-application", label: "Farmer Loans" },
    { href: "/logistics", label: "Logistics" },
    { href: "/warehouse", label: "Warehouse" },
    { href: "/investor", label: "Investor Desk" },
  ];

  const mainNavLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Farmer Dashboard" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/product-listing", label: "Categories" },
    { href: "/order-management", label: "Order Management" },
    { href: "/equipment-listing", label: "Equipment" },
    { href: "/about-us", label: "About Us" },
    { href: "/investor", label: "Vision" },
  ];

  return (
    <header className="border-b border-slate-200 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="bg-green-800 text-green-50">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-2">
          <div className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.04em] lg:flex">
            {topBarLinks.map((item, index) => (
              <span key={item.href} className="flex items-center gap-2">
                <Link
                  href={item.href}
                  className={`rounded px-1 py-0.5 transition hover:bg-white/15 ${isRouteActive(pathname, item.href) ? "active-utility-link" : ""}`}
                >
                  {item.label}
                </Link>
                {index < topBarLinks.length - 1 ? <span className="opacity-65">•</span> : null}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.05em]">
            <Link href="/about-us" className="rounded px-2 py-1 transition hover:bg-white/15">About Vision</Link>
            <Link href="/investor" className="rounded px-2 py-1 transition hover:bg-white/15">Investor</Link>
            <Link href="/admin/login" className="rounded bg-green-950/45 px-2 py-1 transition hover:bg-green-950/65">Admin</Link>
          </div>
        </div>
      </div>

      <nav className="bg-white text-slate-900">
        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-3 px-4 py-3.5">
          <Link
            href="/"
            className="mr-1 flex min-w-fit items-center gap-2"
          >
            <Image
              src={dosLogo}
              alt="DOS AGROLINK NIGERIA logo"
              width={44}
              height={44}
              className="rounded-lg border border-green-200"
            />
            <div>
              <p className="whitespace-nowrap text-base font-extrabold leading-none tracking-tight text-green-900">DOS AGROLINK NIGERIA</p>
              <p className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-green-700">From farm value to market strength</p>
            </div>
          </Link>

          <div className="dos-header-nav-scroll hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto lg:flex">
            {mainNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-2.5 py-2 text-[12px] font-bold uppercase tracking-[0.03em] transition hover:bg-green-50 hover:text-green-900 ${isRouteActive(pathname, item.href) ? "active-main-link" : "text-slate-700"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full border border-green-200 bg-green-50 px-2 py-1 text-[11px] font-semibold text-green-800 xl:inline-flex">
              {copy.syncStatus}: {isOnline ? copy.online : copy.offline} · {copy.queued} {pendingQueueCount}
            </span>

            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as UiLanguage)}
              aria-label="Choose language"
              className="min-h-9 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-700"
            >
              <option value="en">EN</option>
              <option value="ha">HA</option>
              <option value="yo">YO</option>
              <option value="ig">IG</option>
              <option value="pcm">PC</option>
            </select>

            {user ? (
              <>
                <Link href="/marketplace" className="hidden rounded-md bg-green-700 px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:bg-green-800 xl:inline-flex">
                  Explore Market
                </Link>

                {user.role === "farmer" && (
                  <Link href="/farmer/upload" className={`hidden rounded-md border border-amber-300 px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-amber-700 transition hover:bg-amber-50 xl:inline-flex ${isRouteActive(pathname, "/farmer/upload") ? "active-main-link" : ""}`}>
                    Upload
                  </Link>
                )}

                {user.role === "buyer" && (
                  <Link href="/orders" className={`hidden rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] transition hover:bg-green-50 xl:inline-flex ${isRouteActive(pathname, "/orders") ? "active-main-link" : "text-slate-700"}`}>
                    Orders
                  </Link>
                )}

                {user.role === "admin" && (
                  <Link href="/admin" className={`hidden rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] transition hover:bg-green-50 xl:inline-flex ${isRouteActive(pathname, "/admin") ? "active-main-link" : "text-slate-700"}`}>
                    Admin Dashboard
                  </Link>
                )}

                <span className="hidden text-xs font-semibold text-slate-500 xl:inline">{user.name}</span>

                <button
                  onClick={handleLogout}
                  className="touch-target rounded-md border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-slate-700 transition hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`touch-target rounded-md px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] transition hover:bg-green-50 ${isRouteActive(pathname, "/login") ? "active-main-link" : "text-slate-700"}`}>
                  Sign In
                </Link>
                <Link href="/register" className={`touch-target rounded-md bg-green-700 px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-white transition hover:bg-green-800 ${isRouteActive(pathname, "/register") ? "ring-2 ring-green-200" : ""}`}>
                  Sign Up
                </Link>
                <Link href="/marketplace" className="hidden rounded-md border border-green-300 bg-green-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.04em] text-green-800 transition hover:bg-green-100 xl:inline-flex">
                  Explore
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-200 lg:hidden">
          <div className="mx-auto flex w-full max-w-[1400px] gap-1 overflow-x-auto px-4 py-2">
            {mainNavLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.03em] transition ${isRouteActive(pathname, item.href) ? "active-main-link" : "text-slate-700 hover:bg-green-50 hover:text-green-900"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
