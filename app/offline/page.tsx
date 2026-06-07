import type { Metadata } from "next";
import TryAgainButton from "./TryAgainButton";

export const metadata: Metadata = {
  title: "You're offline – DosAgrolink",
  robots: { index: false },
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      {/* Wifi-off icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-10 w-10 text-green-600"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <circle cx="12" cy="20" r="1" fill="currentColor" />
        </svg>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">You&apos;re offline</h1>
        <p className="max-w-xs text-sm text-gray-500">
          Check your internet connection and try again. Pages you&apos;ve visited
          recently may still be available.
        </p>
      </div>

      <TryAgainButton />

      <p className="text-xs text-gray-400">
        DosAgrolink &mdash; Nigeria&apos;s Agricultural Marketplace
      </p>
    </main>
  );
}
