
"use client";
import { FaWhatsapp } from 'react-icons/fa';
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import dosLogo from "../dos logo.jpg";
import { isRouteActive } from "../src/lib/navigationActive";
import { emitLanguageChanged, getStoredLanguage, listenToLanguageChanges, setStoredLanguage, type UiLanguage } from "@services/uiLanguage";

const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '234XXXXXXXXXX';

const languageOptions: Array<{ label: string; value: UiLanguage }> = [
  { label: "En", value: "en" },
  { label: "Yo", value: "yo" },
  { label: "Ig", value: "ig" },
  { label: "Ha", value: "ha" },
];

export default function NavBar() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<UiLanguage>("en");

  useEffect(() => {
    setLanguage(getStoredLanguage());
    return listenToLanguageChanges(setLanguage);
  }, []);

  const handleLanguageChange = (nextLanguage: UiLanguage) => {
    setLanguage(nextLanguage);
    setStoredLanguage(nextLanguage);
    emitLanguageChanged();
  };

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/loan-application", label: "Finance" },
    { href: "/insurance", label: "Insurance" },
    { href: "/logistics", label: "Logistics" },
    { href: "/warehouse", label: "Warehouse" },
    { href: "/investor", label: "Investor Desk" },
    { href: "/about-us", label: "About Us" },
  ];

  return (
    <>
      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 rounded-full shadow-lg p-4 flex items-center justify-center"
        title="Chat with us"
        style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}
      >
        <FaWhatsapp className="text-white text-3xl" />
      </a>
      <header>
        <div className="dos-topbar">
          <Link href="/" className="dos-brand" aria-label="Go to homepage">
            <Image src={dosLogo} alt="DosAgrolink" width={26} height={26} className="dos-brand-logo" />
            <strong>DosAgrolink</strong>
          </Link>
          <nav className="dos-menu" aria-label="Primary">
            {primaryLinks.map((item, index) => (
              <span key={item.href} className="flex items-center gap-2">
                <Link
                  href={item.href}
                  className={isRouteActive(pathname, item.href) ? "active-nav-link" : undefined}
                >
                  {item.label}
                </Link>
                {index < primaryLinks.length - 1 ? <span className="opacity-65">•</span> : null}
              </span>
            ))}
          </nav>
        </div>
        <div className="dos-subbar">
          <div className="dos-subbar-contact" aria-label="Contact and language">
            <span>Call Us</span>
            <span>|</span>
            <span>WhatsApp</span>
            <span>|</span>
            <div className="dos-nav-language-switch" role="group" aria-label="Change language">
              {languageOptions.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleLanguageChange(item.value)}
                  className={`dos-nav-language-btn ${language === item.value ? "is-active" : ""}`}
                  aria-label={`Switch language to ${item.label}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="dos-subbar-cta-wrap">
            <Link href="/register" className="dos-get-started">Get Started</Link>
          </div>
        </div>
      </header>
    </>
  );
}
