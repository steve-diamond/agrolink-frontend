"use client";
import { useEffect, useRef, useState } from "react";
import API from "@services/api";
import { Notification } from "@/types/notification";

function NotificationToast({ notification, onClose }: { notification: Notification | null, onClose: () => void }) {
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

export default function ClientRootLayout({ children }: { children: React.ReactNode }) {
  const [latestNotification, setLatestNotification] = useState<Notification | null>(null);
  const lastIdRef = useRef<string | null>(null);

  // Poll for notifications every 10s
  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const res = await API.get("/notifications");
        const notifs = Array.isArray(res.data) ? res.data as Notification[] : [];
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
    <>
      <NotificationToast notification={latestNotification} onClose={() => setLatestNotification(null)} />
      {children}
    </>
  );
}