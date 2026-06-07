"use client";
import React from 'react';
import { Notification } from '@/types/notification';
import { useNotifications } from './useNotifications';
import PullToRefresh from '../../components/PullToRefresh';

export default function NotificationsPage() {
  const { notifications, loading, refetch } = useNotifications();
  return (
    <PullToRefresh onRefresh={refetch} successMessage="Notifications updated">
    <main id="main-content" tabIndex={-1} className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="bg-white rounded shadow p-4">
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={loading ? "Loading notifications" : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
        >
          {loading ? (
            <p aria-busy="true">Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p>No notifications yet.</p>
          ) : (
            <ul aria-label="Notifications list">
              {notifications.map((n: Notification) => (
                <li key={n._id || n.id} className="mb-2 border-b pb-2">
                  <p>{n.message}</p>
                  {n.date && (
                    <time className="text-xs text-gray-500" dateTime={n.date}>
                      {n.date}
                    </time>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
    </PullToRefresh>
  );
}
