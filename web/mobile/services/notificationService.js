// notificationService.js
// Fetch notifications from API and support offline fallback
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

export const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');
    await AsyncStorage.setItem('notifications', JSON.stringify(res.data));
    return res.data;
  } catch {
    // fallback to offline
    const offline = await AsyncStorage.getItem('notifications');
    return offline ? JSON.parse(offline) : [];
  }
};
