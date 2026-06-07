"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Don't show if user previously dismissed
    try {
      if (localStorage.getItem(DISMISSED_KEY)) {
        setDismissed(true);
        return;
      }
    } catch {
      // localStorage may be unavailable in private browsing
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      // Fire analytics if gtag is available
      try {
        (
          window as Window & { gtag?: (...args: unknown[]) => void }
        ).gtag?.("event", "pwa_install", {
          event_category: "PWA",
          event_label: "install_accepted",
        });
      } catch {
        // Analytics not critical
      }
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Ignore storage errors
    }
    setDismissed(true);
  };

  if (!deferredPrompt || dismissed || installed) return null;

  return (
    <div
      role="complementary"
      aria-label="Install DosAgrolink app"
      className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-50 mx-3 mb-3 animate-slide-down"
    >
      <div className="rounded-2xl border border-green-100 bg-white p-4 shadow-2xl shadow-green-900/10 sm:mx-auto sm:max-w-sm">
        <div className="flex items-start gap-3">
          {/* App icon */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-72x72.png"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Install DosAgrolink
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              Quick access to Nigeria&apos;s agricultural marketplace
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="shrink-0 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={handleDismiss}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 active:bg-gray-100"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="flex-1 rounded-xl bg-green-600 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-green-700 active:bg-green-800"
          >
            Install app
          </button>
        </div>
      </div>
    </div>
  );
}
