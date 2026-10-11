import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { orderService } from '../services/orderService';
import EmptyState from '../components/EmptyState';

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    discountAmount,
    appliedCoupon,
    totalPrice,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useContext(CartContext);

  const [couponInput, setCouponInput] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleConfirmClear = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) {
      Alert.alert('Coupon Required', 'Please enter a promo code.');
      return;
    }

    try {
      setValidatingCoupon(true);
      const res = await orderService.validateCoupon(code, itemsPrice);
      applyCoupon(res);
      setCouponInput('');
      Alert.alert('🎉 Promo Applied!', `${res.description} has been applied to your order.`);
    } catch (error) {
      Alert.alert('Invalid Promo', error.message || 'Coupon could not be applied.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const freeShippingThreshold = 50;
  const amountForFreeShipping = (freeShippingThreshold - itemsPrice).toFixed(2);

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Your Cart is Empty"
        message="Looks like you haven't added anything to your cart yet. Explore our latest products!"
        buttonText="Start Shopping"
        onPress={() => navigation.navigate('Home')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Free Shipping Tip Bar */}
      {itemsPrice < freeShippingThreshold ? (
        <View style={styles.shippingNotice}>
          <Ionicons name="gift-outline" size={16} color="#B45309" />
          <Text style={styles.shippingNoticeText}>
            Add <Text style={{ fontWeight: '700' }}>${amountForFreeShipping}</Text> more for FREE delivery!
          </Text>
        </View>
      ) : (
        <View style={[styles.shippingNotice, styles.shippingFreeNotice]}>
          <Ionicons name="checkmark-circle-outline" size={16} color="#15803D" />
          <Text style={[styles.shippingNoticeText, styles.shippingFreeNoticeText]}>
            Congratulations! You've unlocked FREE delivery.
          </Text>
        </View>
      )}

      {/* Cart Items List */}
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.product}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerRow}>
            <Text style={styles.itemCountHeader}>
              {cartItems.length} {cartItems.length === 1 ? 'Product' : 'Products'} in Cart
            </Text>
            <TouchableOpacity onPress={handleConfirmClear}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cartCard}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />

            <View style={styles.itemInfo}>
              <View style={styles.itemTopRow}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <TouchableOpacity
                  onPress={() => removeFromCart(item.product)}
                  style={styles.deleteButton}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemPrice}>${Number(item.price).toFixed(2)}</Text>

              <View style={styles.actionRow}>
                <View style={styles.qtyControl}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => decreaseQty(item.product)}
                  >
                    <Ionicons name="remove" size={16} color="#334155" />
                  </TouchableOpacity>

                  <Text style={styles.qtyText}>{item.qty}</Text>

                  <TouchableOpacity
                    style={[
                      styles.qtyBtn,
                      item.qty >= item.countInStock && styles.qtyBtnDisabled,
                    ]}
                    onPress={() => increaseQty(item.product)}
                    disabled={item.qty >= item.countInStock}
                  >
                    <Ionicons
                      name="add"
                      size={16}
                      color={item.qty >= item.countInStock ? '#CBD5E1' : '#334155'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemSubtotal}>
                  ${(item.price * item.qty).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          /* Promo Coupon Section */
          <View style={styles.couponContainer}>
            <Text style={styles.couponTitle}>🏷️ Promo Code / Discount</Text>

            {appliedCoupon ? (
              <View style={styles.appliedCouponBadge}>
                <View style={styles.appliedCouponInfo}>
                  <Ionicons name="pricetag" size={16} color="#15803D" />
                  <View style={{ marginLeft: 8 }}>
                    <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                    <Text style={styles.appliedCouponDesc}>{appliedCoupon.description}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                  <Ionicons name="close-circle" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.couponInputRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="Enter code (e.g. SHOPEASE10)"
                    placeholderTextColor="#94A3B8"
                    value={couponInput}
                    onChangeText={setCouponInput}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity
                    style={[styles.applyBtn, validatingCoupon && styles.applyBtnDisabled]}
                    onPress={() => handleApplyCoupon()}
                    disabled={validatingCoupon}
                  >
                    {validatingCoupon ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.applyBtnText}>Apply</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Quick Hint Chips */}
                <View style={styles.chipRow}>
                  <Text style={styles.chipHint}>Quick apply:</Text>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => handleApplyCoupon('SHOPEASE10')}
                  >
                    <Text style={styles.chipText}>SHOPEASE10 (-10%)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.chip}
                    onPress={() => handleApplyCoupon('SAVE20')}
                  >
                    <Text style={styles.chipText}>SAVE20 (-$20)</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        }
      />

      {/* Checkout Summary Card */}
      <View style={styles.footerSummary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Items Subtotal</Text>
          <Text style={styles.summaryValue}>${itemsPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
          </Text>
        </View>

        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: '#166534', fontWeight: '700' }]}>
              Discount ({appliedCoupon?.code})
            </Text>
            <Text style={[styles.summaryValue, { color: '#166534', fontWeight: '700' }]}>
              -${discountAmount.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => navigation.navigate('Checkout')}
          activeOpacity={0.8}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  shippingNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  shippingFreeNotice: {
    backgroundColor: '#DCFCE7',
  },
  shippingNoticeText: {
    fontSize: 12,
    color: '#92400E',
  },
  shippingFreeNoticeText: {
    color: '#166534',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemCountHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF4444',
  },
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    padding: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563EB',
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qtyBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyBtnDisabled: {
    opacity: 0.3,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 8,
    color: '#1E293B',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  couponContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  couponTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 8,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  applyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  chipHint: {
    fontSize: 11,
    color: '#64748B',
  },
  chip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
  appliedCouponBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
  },
  appliedCouponInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedCouponCode: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  appliedCouponDesc: {
    fontSize: 11,
    color: '#166534',
  },
  removeCouponBtn: {
    padding: 4,
  },
  footerSummary: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 16,
    paddingBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  checkoutBtn: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
    gap: 8,
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CartScreen;
