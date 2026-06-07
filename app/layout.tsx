
import "./globals.css";
import "../styles/agrolink-dashboard.css";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import NavBar from "components/NavBar";
import MobileBottomNav from "components/MobileBottomNav";
import SiteFooter from "components/SiteFooter";
import ClientErrorBoundary from "components/ClientErrorBoundary";
import ServiceWorkerRegistration from "components/ServiceWorkerRegistration";
import InstallPWA from "components/InstallPWA";
import { FocusManager } from "components/FocusManager";
import { RouteAnnouncer } from "components/RouteAnnouncer";
import type { Metadata, Viewport } from "next";
import QueryProvider from "components/QueryProvider";
import { AccessibilityProvider } from "components/AccessibilityProvider";
import { absoluteUrl, organizationSchema, siteConfig } from "@/lib/seo";
import CoreWebVitals from "components/CoreWebVitals";
import AnalyticsProvider from "components/analytics/AnalyticsProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Nigerian Agribusiness Platform | DOS AGROLINK",
    template: "%s | DOS AGROLINK",
  },
  description:
    "DOS Agrolink connects Nigerian farmers, buyers, and investors through transparent marketplace trading, agribusiness loans, warehousing, and logistics.",
  keywords: [
    "Nigerian agribusiness",
    "farmer marketplace",
    "agricultural loans",
    "warehouse services",
    "farm logistics",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Nigerian Agribusiness Platform | DOS AGROLINK",
    description:
      "Connect with verified farmers, buyers, and investors using DOS Agrolink's marketplace, logistics, loans, and warehousing tools.",
    type: "website",
    url: absoluteUrl("/"),
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [
      {
        url: absoluteUrl(siteConfig.ogImage),
        width: 1200,
        height: 630,
        alt: "DOS Agrolink digital agriculture platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nigerian Agribusiness Platform | DOS AGROLINK",
    description:
      "Farm finance, produce marketplace, logistics, and warehousing for Nigeria's agricultural value chain.",
    creator: siteConfig.twitterHandle,
    images: [absoluteUrl(siteConfig.ogImage)],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "DosAgrolink",
    statusBarStyle: "black-translucent",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#16A34A",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

// Pure server component layout
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgSchema = organizationSchema();

  return (
    <html lang="en-NG" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <AnalyticsProvider />
        <CoreWebVitals />
        <QueryProvider>
        <AccessibilityProvider>
        <ClientErrorBoundary>
          {/* Skip navigation — first focusable element in the DOM */}
          <FocusManager searchInputId="global-search" />
          <RouteAnnouncer />
          <ServiceWorkerRegistration />
          <NavBar />
          {/*
            id="main-content" is the skip-link target.
            Using <div> rather than <main> so individual pages can provide
            their own <main> landmark without nesting two <main> elements.
          */}
          <div
            id="main-content"
            className="app-shell lg:pb-0 pb-[calc(64px+env(safe-area-inset-bottom,0px))]"
            tabIndex={-1}
          >
            {children}
          </div>
          <SiteFooter />
          <MobileBottomNav />
          <InstallPWA />
          {/* Live region for announcements (toasts, status updates) */}
          <div
            id="aria-live-region"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
        </ClientErrorBoundary>
        </AccessibilityProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
