
"use client";
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isRouteActive } from "../src/lib/navigationActive";
import { emitLanguageChanged, getStoredLanguage, listenToLanguageChanges, setStoredLanguage, type UiLanguage } from "@services/uiLanguage";

const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '2348129490467';
const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || supportPhone;
const formattedSupportPhone = '+234 812 949 0467';

const languageOptions: Array<{ label: string; value: UiLanguage }> = [
  { label: "EN", value: "en" },
  { label: "YO", value: "yo" },
  { label: "IG", value: "ig" },
  { label: "HA", value: "ha" },
];

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/loan-application", label: "Finance" },
  { href: "/insurance", label: "Insurance" },
  { href: "/logistics", label: "Logistics" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/investor", label: "Investor Desk" },
  { href: "/about-us", label: "About" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<UiLanguage>("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileNavId = "mobile-nav";

  useEffect(() => {
    setLanguage(getStoredLanguage());
    return listenToLanguageChanges(setLanguage);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const handleLanguageChange = (nextLanguage: UiLanguage) => {
    setLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);
    emitLanguageChanged();
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl transition-all hover:scale-110"
        aria-label="Chat with us on WhatsApp (opens in new tab)"
      >
        <FaWhatsapp className="text-white text-2xl" aria-hidden="true" />
      </a>

      {/* ── Unified Sticky Header ── */}
      <header
        id="main-nav"
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? "shadow-lg bg-green-950/98 backdrop-blur-sm"
            : "bg-green-950"
        }`}
      >
        {/* Top utility bar */}
        <div className="border-b border-white/10 bg-green-900/70">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-green-50/90">
            <div className="flex items-center gap-4">
              <a href={`tel:+${supportPhone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <FaPhone className="text-green-400" aria-hidden="true" />
                <span className="hidden sm:inline">{formattedSupportPhone}</span>
                <span className="sm:hidden">Call Us</span>
              </a>
              <span className="opacity-40" aria-hidden="true">|</span>
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
                aria-label="WhatsApp us (opens in new tab)"
              >
                <FaWhatsapp className="text-green-400" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            </div>
            {/* Language switcher */}
            <div className="flex items-center gap-1" role="group" aria-label="Language">
              {languageOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleLanguageChange(opt.value)}
                  className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${
                    language === opt.value
                      ? "bg-amber-500 text-green-950"
                      : "text-green-300 hover:text-white"
                  }`}
              aria-label={`Switch language to ${opt.label}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main nav bar */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3 shrink-0" aria-label="Dos Agrolink home">
            <div className="relative">
              <Image
                src="/dos-agrolink-logo.jpg"
                alt="Dos Agrolink"
                width={44}
                height={44}
                className="rounded-full object-cover border-2 border-amber-400/60 shadow-md"
                priority
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-green-950" title="Online" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="block text-base font-extrabold text-white tracking-tight">DOS AGROLINK</span>
              <span className="block text-[10px] text-green-400 font-semibold tracking-widest uppercase">Nigeria&apos;s Agri-Marketplace</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 rounded-xl bg-green-900/55 px-2 py-1 ring-1 ring-white/15" aria-label="Primary">
            {navLinks.map((item) => {
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    active
                      ? "bg-amber-500 text-green-950 shadow"
                      : "text-emerald-50 hover:bg-white/15 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold text-white border border-white/30 hover:bg-white/10 transition-all"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-green-950 shadow transition-all"
            >
              Get Started
            </Link>
            {/* Mobile hamburger */}
<button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls={mobileNavId}
              aria-haspopup="true"
            >
              {/* Animated hamburger / close icon */}
              <span aria-hidden="true" className="flex flex-col items-center justify-center w-5 h-4 gap-1.25">
                <span className={`block w-full h-0.5 bg-white rounded transition-transform origin-center duration-200 ${menuOpen ? "translate-y-1.75 rotate-45" : ""}`} />
                <span className={`block w-full h-0.5 bg-white rounded transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`block w-full h-0.5 bg-white rounded transition-transform origin-center duration-200 ${menuOpen ? "-translate-y-1.75 -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <nav
            id={mobileNavId}
            className="lg:hidden border-t border-white/10 bg-green-900/95 backdrop-blur-sm px-4 py-3 space-y-1"
            aria-label="Mobile navigation"
          >
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isRouteActive(pathname, item.href) ? "page" : undefined}
                className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isRouteActive(pathname, item.href)
                    ? "bg-amber-500 text-green-950"
                    : "text-green-100 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 flex gap-2 border-t border-white/10 mt-2">
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg border border-white/20 text-sm font-semibold text-green-100 hover:bg-white/10">Login</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2 rounded-lg bg-amber-500 text-green-950 text-sm font-bold">Get Started</Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
