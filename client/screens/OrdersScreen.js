import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const data = await orderService.getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Fetch orders error:', error);
      Alert.alert('Error', error.message || 'Unable to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation, fetchOrders]);

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? The inventory will be immediately restored.',
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel Order',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await orderService.cancelOrder(orderId);
              setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? { ...o, status: 'Cancelled' } : o))
              );
              Alert.alert('Order Cancelled', res.message || 'Your order has been cancelled.');
            } catch (error) {
              Alert.alert('Cancellation Failed', error.message || 'Could not cancel order.');
            }
          },
        },
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
      default: // Pending
        return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your orders..." />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="receipt-outline"
        title="No Orders Found"
        message="You haven't placed any orders yet. Discover great items in our catalog!"
        buttonText="Explore Products"
        onPress={() => navigation.navigate('Home')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            colors={['#2563EB']}
          />
        }
        renderItem={({ item }) => {
          const statusColors = getStatusColor(item.status);
          const isPending = item.status === 'Pending';

          return (
            <View style={styles.orderCard}>
              {/* Header with Order ID & Status */}
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>
                    Order #{item._id.slice(-6).toUpperCase()}
                  </Text>
                  <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                  <Text style={[styles.statusText, { color: statusColors.text }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Items in the Order */}
              <View style={styles.itemsList}>
                {item.orderItems.map((orderItem, idx) => (
                  <View key={idx} style={styles.itemRow}>
                    <Image source={{ uri: orderItem.image }} style={styles.itemImage} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {orderItem.name}
                      </Text>
                      <Text style={styles.itemQtyPrice}>
                        Qty: {orderItem.qty} × ${Number(orderItem.price).toFixed(2)}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      ${(orderItem.qty * orderItem.price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Discount / Coupon pill if applied */}
              {item.discountAmount > 0 && (
                <View style={styles.discountRow}>
                  <Ionicons name="pricetag" size={14} color="#15803D" />
                  <Text style={styles.discountText}>
                    Coupon Discount ({item.couponCode || 'PROMO'}): -${Number(item.discountAmount).toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              {/* Destination, Total Price & Actions */}
              <View style={styles.orderFooter}>
                <View style={styles.addressBox}>
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {item.shippingAddress?.city}, {item.shippingAddress?.country}
                  </Text>
                </View>

                <View style={styles.totalBox}>
                  <Text style={styles.totalLabel}>Grand Total:</Text>
                  <Text style={styles.totalValue}>
                    ${Number(item.totalPrice).toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Cancel Order Action Button (for Pending orders) */}
              {isPending && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelOrderBtn}
                    onPress={() => handleCancelOrder(item._id)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close-circle-outline" size={16} color="#DC2626" />
                    <Text style={styles.cancelOrderBtnText}>Cancel Order</Text>
                  </TouchableOpacity>
                </View>
              )}
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
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  orderDate: {
    fontSize: 12,
    color: '#94A3B8',
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
    marginVertical: 12,
  },
  itemsList: {
    gap: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  itemQtyPrice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  discountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    gap: 6,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  totalLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563EB',
  },
  actionRow: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    gap: 6,
  },
  cancelOrderBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default OrdersScreen;
