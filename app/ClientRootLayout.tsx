"use client";
import { useEffect, useRef } from "react";
import { useNotifications } from "../lib/hooks/useNotifications";
import type { Notification } from "@/types/notification";
import AnimatedLayout from "components/ui/AnimatedLayout";
import { ToastProvider } from "components/ui/ToastManager";
import { useState } from "react";

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

  // React Query polls for notifications every 30 s (REALTIME_QUERY_OPTIONS).
  const { data: notifications } = useNotifications();

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const newest = notifications[0];
    const newestId = newest._id ?? newest.id ?? null;
    if (newest && newestId !== lastIdRef.current) {
      setLatestNotification(newest);
      lastIdRef.current = newestId;
    }
  }, [notifications]);

  return (
    <>
      <NotificationToast notification={latestNotification} onClose={() => setLatestNotification(null)} />
      <AnimatedLayout>{children}</AnimatedLayout>
      <ToastProvider />
    </>
  );
}