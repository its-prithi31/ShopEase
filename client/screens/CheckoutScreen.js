import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { orderService } from '../services/orderService';

const PAYMENT_METHODS = [
  { id: 'Cash on Delivery', icon: 'cash-outline', label: 'Cash on Delivery' },
  { id: 'Credit / Debit Card', icon: 'card-outline', label: 'Credit / Debit Card' },
  { id: 'UPI / Mobile Wallet', icon: 'phone-portrait-outline', label: 'UPI / Mobile Wallet' },
];

const CheckoutScreen = ({ navigation }) => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    discountAmount,
    appliedCoupon,
    totalPrice,
    clearCart,
  } = useContext(CartContext);

  const [address, setAddress] = useState('123 Innovation Drive, Apt 4B');
  const [city, setCity] = useState('San Francisco');
  const [postalCode, setPostalCode] = useState('94103');
  const [country, setCountry] = useState('USA');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    // Validation
    if (!address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      Alert.alert('Incomplete Address', 'Please provide complete delivery address details.');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your shopping cart has no items.');
      navigation.navigate('Home');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
        })),
        shippingAddress: {
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        discountAmount: discountAmount || 0,
        couponCode: appliedCoupon?.code || '',
        totalPrice,
      };

      const createdOrder = await orderService.createOrder(orderData);
      await clearCart();

      Alert.alert(
        '🎉 Order Placed Successfully!',
        `Your order #${createdOrder._id.slice(-6).toUpperCase()} has been confirmed.`,
        [
          {
            text: 'View My Orders',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs', params: { screen: 'Orders' } }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Order error:', error);
      Alert.alert('Order Placement Failed', error.message || 'Unable to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Shipping Address Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color="#2563EB" />
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>

          <Text style={styles.label}>Street Address</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 123 Tech Boulevard"
            placeholderTextColor="#94A3B8"
            value={address}
            onChangeText={setAddress}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. New York"
                placeholderTextColor="#94A3B8"
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Postal Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 10001"
                placeholderTextColor="#94A3B8"
                value={postalCode}
                onChangeText={setPostalCode}
              />
            </View>
          </View>

          <Text style={styles.label}>Country</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. USA"
            placeholderTextColor="#94A3B8"
            value={country}
            onChangeText={setCountry}
          />
        </View>

        {/* Payment Method Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="wallet-outline" size={20} color="#2563EB" />
            <Text style={styles.cardTitle}>Payment Method</Text>
          </View>

          {PAYMENT_METHODS.map((method) => {
            const isSelected = paymentMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[styles.paymentOption, isSelected && styles.paymentOptionSelected]}
                onPress={() => setPaymentMethod(method.id)}
              >
                <View style={styles.paymentLeft}>
                  <Ionicons
                    name={method.icon}
                    size={20}
                    color={isSelected ? '#2563EB' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.paymentLabel,
                      isSelected && styles.paymentLabelSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </View>

                <View
                  style={[styles.radioCircle, isSelected && styles.radioCircleActive]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Order Summary Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={20} color="#2563EB" />
            <Text style={styles.cardTitle}>Order Summary</Text>
          </View>

          {cartItems.map((item) => (
            <View key={item.product} style={styles.summaryItemRow}>
              <Text style={styles.summaryItemName} numberOfLines={1}>
                {item.qty}x {item.name}
              </Text>
              <Text style={styles.summaryItemPrice}>
                ${(item.price * item.qty).toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.summaryDivider} />

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>${itemsPrice.toFixed(2)}</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Delivery Fee</Text>
            <Text style={styles.calcValue}>
              {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
            </Text>
          </View>

          {discountAmount > 0 && (
            <View style={styles.calcRow}>
              <Text style={[styles.calcLabel, { color: '#166534', fontWeight: '700' }]}>
                Discount ({appliedCoupon?.code})
              </Text>
              <Text style={[styles.calcValue, { color: '#166534', fontWeight: '700' }]}>
                -${discountAmount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.calcRowTotal}>
            <Text style={styles.calcTotalLabel}>Total Due</Text>
            <Text style={styles.calcTotalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Place Order CTA Button */}
        <TouchableOpacity
          style={[styles.placeOrderBtn, loading && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.placeOrderText}>
                Confirm & Place Order (${totalPrice.toFixed(2)})
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: '#0F172A',
  },
  row: {
    flexDirection: 'row',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  paymentOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
  paymentLabelSelected: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    marginRight: 8,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  calcLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  calcRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  calcTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  calcTotalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  placeOrderBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  placeOrderBtnDisabled: {
    opacity: 0.7,
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CheckoutScreen;
