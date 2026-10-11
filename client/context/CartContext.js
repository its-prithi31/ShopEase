import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore cart on initial load
  useEffect(() => {
    const loadCart = async () => {
      try {
        const storedCart = await AsyncStorage.getItem('@shopease_cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCart();
  }, []);

  // Save cart changes to AsyncStorage
  const saveCart = async (items) => {
    setCartItems(items);
    try {
      await AsyncStorage.setItem('@shopease_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = (product, qty = 1) => {
    const existItemIndex = cartItems.findIndex((x) => x.product === product._id);

    if (existItemIndex !== -1) {
      const updatedItems = [...cartItems];
      const newQty = updatedItems[existItemIndex].qty + qty;
      const stockLimit = product.countInStock ?? updatedItems[existItemIndex].countInStock;

      updatedItems[existItemIndex] = {
        ...updatedItems[existItemIndex],
        qty: Math.min(newQty, stockLimit),
      };
      saveCart(updatedItems);
    } else {
      const newItem = {
        product: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
        qty: Math.min(qty, product.countInStock || 1),
      };
      saveCart([...cartItems, newItem]);
    }
  };

  /**
   * Increase item quantity
   */
  const increaseQty = (productId) => {
    const updated = cartItems.map((item) => {
      if (item.product === productId) {
        if (item.qty < item.countInStock) {
          return { ...item, qty: item.qty + 1 };
        }
      }
      return item;
    });
    saveCart(updated);
  };

  /**
   * Decrease item quantity
   */
  const decreaseQty = (productId) => {
    const target = cartItems.find((item) => item.product === productId);
    if (!target) return;

    if (target.qty <= 1) {
      removeFromCart(productId);
    } else {
      const updated = cartItems.map((item) => {
        if (item.product === productId) {
          return { ...item, qty: item.qty - 1 };
        }
        return item;
      });
      saveCart(updated);
    }
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId) => {
    const filtered = cartItems.filter((item) => item.product !== productId);
    saveCart(filtered);
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    setCartItems([]);
    setAppliedCoupon(null);
    try {
      await AsyncStorage.removeItem('@shopease_cart');
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  /**
   * Apply / Remove Promo Coupon
   */
  const applyCoupon = (coupon) => {
    setAppliedCoupon(coupon);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Derived calculations
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );

  // Free shipping if subtotal > $50, else $10 standard flat fee
  let shippingPrice = itemsPrice > 50 || itemsPrice === 0 ? 0 : 10;
  let discountAmount = 0;

  if (appliedCoupon && itemsPrice > 0) {
    if (appliedCoupon.discountType === 'percent') {
      discountAmount = Number(((itemsPrice * appliedCoupon.discountValue) / 100).toFixed(2));
    } else if (appliedCoupon.discountType === 'flat') {
      discountAmount = Math.min(appliedCoupon.discountValue, itemsPrice);
    } else if (appliedCoupon.discountType === 'shipping') {
      discountAmount = shippingPrice;
      shippingPrice = 0;
    }
  }

  const totalPrice = Number(
    Math.max(0, itemsPrice + shippingPrice - discountAmount).toFixed(2)
  );
  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        totalQty,
        itemsPrice,
        shippingPrice,
        discountAmount,
        appliedCoupon,
        totalPrice,
        addToCart,
        removeFromCart,
        increaseQty,
        decreaseQty,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
