import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { fetchNotifications } from '../services/notificationService';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    setRefreshing(true);
    const data = await fetchNotifications();
    setNotifications(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={item => item._id || item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8 }}>
            <Text>{item.message}</Text>
            <Text style={{ color: '#888', fontSize: 12 }}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}
