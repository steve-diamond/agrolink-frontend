import "./globals.css";
import "../styles/agrolink-dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import NavBar from "@components/NavBar";
import SiteFooter from "@components/SiteFooter";
import ClientErrorBoundary from "@components/ClientErrorBoundary";
import ServiceWorkerRegistration from "@components/ServiceWorkerRegistration";
import { useEffect, useRef, useState } from "react";
import { api } from "@services/api";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DOS AGROLINK NIGERIA",
  description: "Digital platform for Nigerian smallholder farmers.",
  manifest: "/manifest.webmanifest",
};

function NotificationToast({ notification, onClose }: { notification: any, onClose: () => void }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);
  if (!notification) return null;
  return (
    <div className="fixed top-4 right-4 z-50 bg-green-900 text-white px-4 py-3 rounded shadow-lg animate-fade-in">
      <div className="font-bold">Notification</div>
      <div>{notification.message}</div>
      <button className="absolute top-1 right-2 text-white" onClick={onClose}>&times;</button>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const lastIdRef = useRef<string | null>(null);

  // Poll for notifications every 10s
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await api.get("/notifications");
        const notifs = Array.isArray(res.data) ? res.data : [];
        if (notifs.length > 0) {
          const newest = notifs[0];
          if (newest && newest._id !== lastIdRef.current) {
            setLatestNotification(newest);
            lastIdRef.current = newest._id;
          }
        }
      } catch {}
      if (mounted) setTimeout(poll, 10000);
    };
    poll();
    return () => { mounted = false; };
  }, []);

  return (
    <html lang="en-NG">
      <body>
        <ClientErrorBoundary>
          <ServiceWorkerRegistration />
          <NavBar />
          <NotificationToast notification={latestNotification} onClose={() => setLatestNotification(null)} />
          <div className="app-shell">{children}</div>
          <SiteFooter />
        </ClientErrorBoundary>
      </body>
    </html>
  );
}
