import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const STATUS_CHOICES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const AdminOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch all orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  const handleChangeStatus = (orderId, currentStatus) => {
    Alert.alert(
      'Update Order Status',
      `Current Status: ${currentStatus}`,
      [
        ...STATUS_CHOICES.map((choice) => ({
          text: choice,
          onPress: async () => {
            try {
              const isDelivered = choice === 'Delivered';
              await orderService.updateOrderStatus(orderId, {
                status: choice,
                isDelivered,
              });
              Alert.alert('Updated', `Order marked as ${choice}`);
              fetchAllOrders();
            } catch (error) {
              Alert.alert('Error', error.message || 'Status update failed');
            }
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'Shipped':
        return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'Processing':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'Cancelled':
        return { bg: '#FEE2E2', text: '#991B1B' };
      default:
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading all store orders..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="cube-outline"
        title="No Orders Yet"
        message="No customer has placed an order yet."
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAllOrders(true)}
            colors={['#2563EB']}
          />
        }
        renderItem={({ item }) => {
          const colors = getStatusColor(item.status);
          return (
            <View style={styles.orderCard}>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={styles.orderId}>
                    Order #{item._id.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={styles.customerName}>
                    Customer: {item.user?.name || 'Unknown'} ({item.user?.email || 'N/A'})
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: colors.bg }]}
                  onPress={() => handleChangeStatus(item._id, item.status)}
                >
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    {item.status} ▾
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Items summary */}
              <View style={styles.itemsSummary}>
                {item.orderItems.map((prod, idx) => (
                  <Text key={idx} style={styles.itemText} numberOfLines={1}>
                    • {prod.qty}x {prod.name} (${prod.price} each)
                  </Text>
                ))}
              </View>

              <View style={styles.divider} />

              {/* Destination & Action */}
              <View style={styles.footerRow}>
                <View>
                  <Text style={styles.address}>
                    📍 {item.shippingAddress?.address}, {item.shippingAddress?.city}
                  </Text>
                  <Text style={styles.paymentMethod}>
                    💳 {item.paymentMethod}
                  </Text>
                </View>

                <View style={styles.totalBox}>
                  <Text style={styles.totalAmount}>${Number(item.totalPrice).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  customerName: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  itemsSummary: {
    gap: 4,
  },
  itemText: {
    fontSize: 13,
    color: '#334155',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  address: {
    fontSize: 12,
    color: '#64748B',
  },
  paymentMethod: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  totalBox: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
});

export default AdminOrdersScreen;
