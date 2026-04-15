// OrderTrackingScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import orderService from '../services/orderService';
import { getOfflineData, saveOfflineData } from '../services/offlineService';

export default function OrderTrackingScreen() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    setRefreshing(true);
    try {
      const data = await orderService.getMyOrders();
      setOrders(data);
      saveOfflineData('orders', data);
    } catch (e) {
      // fallback to offline data
      const offline = await getOfflineData('orders');
      if (offline) setOrders(offline);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Order Tracking</Text>
      <FlatList
        data={orders}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOrders} />}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12, padding: 12, backgroundColor: '#fff', borderRadius: 8 }}>
            <Text>Order ID: {item._id}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Product: {item.productName}</Text>
            <Text>Quantity: {item.quantity}</Text>
          </View>
        )}
      />
    </View>
  );
}
