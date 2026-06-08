"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log to error reporting service in production
    if (process.env.NODE_ENV === "production") {
      // Sentry.captureException(error);
    }
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
      <p className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-700">
        Something went wrong
      </p>
      <h1 className="mt-4 text-3xl font-extrabold text-red-900 sm:text-4xl">
        An unexpected error occurred
      </h1>
      <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
        We&apos;re sorry — something went wrong on our end. Our team has been
        notified. Please try again or return to the homepage.
      </p>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-left text-xs text-red-800 w-full max-w-xl">
          <summary className="cursor-pointer font-semibold">Error details (dev only)</summary>
          <pre className="mt-2 whitespace-pre-wrap break-all">{error.message}</pre>
          {error.digest && <p className="mt-1 text-red-600">Digest: {error.digest}</p>}
        </details>
      )}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-green-300 px-5 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50"
        >
          Go to Homepage
        </Link>
        <Link
          href="/marketplace"
          className="rounded-xl border border-green-300 px-5 py-2.5 text-sm font-semibold text-green-800 hover:bg-green-50"
        >
          Browse Marketplace
        </Link>
      </div>
    </main>
  );
}
