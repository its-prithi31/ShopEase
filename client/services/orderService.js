import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCAL_COUPONS = {
  SHOPEASE10: {
    code: 'SHOPEASE10',
    type: 'percent',
    value: 10,
    minSpend: 0,
    description: '10% discount on entire order',
  },
  SAVE20: {
    code: 'SAVE20',
    type: 'flat',
    value: 20,
    minSpend: 50,
    description: '$20 off on orders over $50',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'shipping',
    value: 10,
    minSpend: 0,
    description: 'Free standard shipping',
  },
  WELCOME50: {
    code: 'WELCOME50',
    type: 'flat',
    value: 50,
    minSpend: 150,
    description: '$50 off on premium orders over $150',
  },
};

const getLocalOrders = async () => {
  try {
    const raw = await AsyncStorage.getItem('@shopease_local_orders');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveLocalOrders = async (orders) => {
  try {
    await AsyncStorage.setItem('@shopease_local_orders', JSON.stringify(orders));
  } catch (e) {}
};

export const orderService = {
  /**
   * Validate discount promo coupon
   */
  async validateCoupon(code, itemsPrice = 0) {
    try {
      const response = await api.post('/orders/validate-coupon', { code, itemsPrice });
      return response.data;
    } catch (networkError) {
      const cleanCode = code ? code.trim().toUpperCase() : '';
      const coupon = LOCAL_COUPONS[cleanCode];
      if (!coupon) {
        throw new Error('Invalid promo code. Available: SHOPEASE10, SAVE20, FREESHIP, WELCOME50');
      }

      if (itemsPrice < coupon.minSpend) {
        throw new Error(`Minimum items spend of $${coupon.minSpend} required for promo code ${cleanCode}`);
      }

      let discountAmount = 0;
      if (coupon.type === 'percent') {
        discountAmount = Number(((itemsPrice * coupon.value) / 100).toFixed(2));
      } else if (coupon.type === 'flat') {
        discountAmount = Math.min(coupon.value, itemsPrice);
      } else if (coupon.type === 'shipping') {
        discountAmount = 10;
      }

      return {
        valid: true,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        description: coupon.description,
      };
    }
  },

  /**
   * Place an order
   */
  async createOrder(orderData) {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (networkError) {
      console.warn('Network create order failed, saving locally:', networkError.message);
      const newOrder = {
        _id: `ord_${Date.now()}`,
        ...orderData,
        isPaid: false,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      const existing = await getLocalOrders();
      existing.unshift(newOrder);
      await saveLocalOrders(existing);
      return newOrder;
    }
  },

  /**
   * Customer cancel order
   */
  async cancelOrder(orderId) {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (networkError) {
      const existing = await getLocalOrders();
      const match = existing.find((o) => o._id === orderId);
      if (match) {
        match.status = 'Cancelled';
        await saveLocalOrders(existing);
        return { message: 'Order cancelled successfully', order: match };
      }
      throw networkError;
    }
  },

  /**
   * Fetch current user's orders
   */
  async getMyOrders() {
    try {
      const response = await api.get('/orders/myorders');
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      const local = await getLocalOrders();
      return local.length > 0 ? local : (Array.isArray(response.data) ? response.data : []);
    } catch (networkError) {
      console.warn('Network get my orders failed, checking local:', networkError.message);
      return await getLocalOrders();
    }
  },

  /**
   * Fetch order details by ID
   */
  async getOrderById(id) {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (networkError) {
      const local = await getLocalOrders();
      const match = local.find((o) => o._id === id);
      if (match) return match;
      throw networkError;
    }
  },

  /**
   * Fetch all orders (Admin)
   */
  async getAllOrders() {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (networkError) {
      return await getLocalOrders();
    }
  },

  /**
   * Update order status (Admin)
   */
  async updateOrderStatus(id, statusData) {
    try {
      const response = await api.put(`/orders/${id}/status`, statusData);
      return response.data;
    } catch (networkError) {
      const local = await getLocalOrders();
      const match = local.find((o) => o._id === id);
      if (match) {
        match.status = statusData.status || match.status;
        await saveLocalOrders(local);
        return match;
      }
      throw networkError;
    }
  },
};

export default orderService;
