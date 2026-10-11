const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Validate promotional discount coupon
router.post('/validate-coupon', validateCoupon);

// Customer create order / Admin view all orders
router.route('/')
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

// Customer view their own orders
router.get('/myorders', protect, getMyOrders);

// Customer cancel order
router.put('/:id/cancel', protect, cancelOrder);

// View single order by ID
router.get('/:id', protect, getOrderById);

// Admin update order status
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
