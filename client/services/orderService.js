import api from './api';

export const orderService = {
  /**
   * Validate discount promo coupon
   */
  async validateCoupon(code, itemsPrice) {
    const response = await api.post('/orders/validate-coupon', { code, itemsPrice });
    return response.data;
  },

  /**
   * Place an order
   */
  async createOrder(orderData) {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Customer cancel order
   */
  async cancelOrder(orderId) {
    const response = await api.put(`/orders/${orderId}/cancel`);
    return response.data;
  },

  /**
   * Fetch current user's orders
   */
  async getMyOrders() {
    const response = await api.get('/orders/myorders');
    return response.data;
  },

  /**
   * Fetch order details by ID
   */
  async getOrderById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  /**
   * Fetch all orders (Admin)
   */
  async getAllOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  /**
   * Update order status (Admin)
   */
  async updateOrderStatus(id, statusData) {
    const response = await api.put(`/orders/${id}/status`, statusData);
    return response.data;
  },
};
