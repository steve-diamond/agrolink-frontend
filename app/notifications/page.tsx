"use client";
import React from 'react';
import { Notification } from '@/types/notification';
import { useNotifications } from './useNotifications';

export default function NotificationsPage() {
  const { notifications, loading } = useNotifications();
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          <ul>
            {notifications.map((n: Notification) => (
              <li key={n._id || n.id} className="mb-2 border-b pb-2">
                <div>{n.message}</div>
                <div className="text-xs text-gray-500">{n.date}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
