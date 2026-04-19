"use client";
import API from '@/services/api';
import { useEffect, useState } from 'react';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await API.get('/notifications');
        setNotifications(res.data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  return { notifications, loading };
}
