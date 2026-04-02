import "./globals.css";
import NavBar from "@/components/NavBar";
import ClientErrorBoundary from "@/components/ClientErrorBoundary";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DOS AGROLINK NIGERIA",
  description: "Digital platform for Nigerian smallholder farmers.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-NG">
      <body>
        <ClientErrorBoundary>
          <ServiceWorkerRegistration />
          <NavBar />
          <div className="app-shell">{children}</div>
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
