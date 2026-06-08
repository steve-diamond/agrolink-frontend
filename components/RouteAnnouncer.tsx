"use client";

/**
 * RouteAnnouncer — announces route/page changes to screen readers.
 *
 * Single-page applications don't trigger a browser navigation event, so
 * screen readers never know the page changed. This component watches the
 * URL and writes a descriptive announcement into an `aria-live="polite"`
 * region so screen readers can pick it up.
 *
 * Mount once in the root layout (client layout boundary).
 *
 * @example
 * // app/ClientRootLayout.tsx
 * <RouteAnnouncer />
 */

import * as React from "react";
import { usePathname } from "next/navigation";

/** Build a human-readable page name from a Next.js pathname. */
function pathnameToTitle(pathname: string): string {
  if (pathname === "/") return "Home";

  // Strip trailing slash, split by "/", take last segment
  const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  const last = segments[segments.length - 1] ?? "";

  // Convert kebab/snake to title-case
  const readable = last
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return readable || "Page";
}

export const RouteAnnouncer: React.FC = () => {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = React.useState("");
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    // Skip the very first render — the page loaded normally, not via SPA nav
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Build the announcement from the document title or pathname
    const pageTitle = document.title
      ? document.title.replace(/\s*[|–-]\s*.+$/, "").trim() // strip " | Site Name"
      : pathnameToTitle(pathname);

    const message = `Navigated to ${pageTitle}`;

    // Clear then re-set to ensure re-announcement on same route (edge case)
    setAnnouncement("");
    const t = setTimeout(() => setAnnouncement(message), 100);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};
