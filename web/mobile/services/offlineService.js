// offlineService.js
// Simple offline storage and sync for React Native using AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveOfflineData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // handle error
  }
};

export const getOfflineData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    // handle error
    return null;
  }
};

export const removeOfflineData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // handle error
  }
};
