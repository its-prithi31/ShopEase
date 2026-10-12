const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const inMemoryStore = require('../data/inMemoryStore');

// Valid promotional coupons configuration
const PROMO_COUPONS = {
  SHOPEASE10: {
    code: 'SHOPEASE10',
    type: 'percent',
    value: 10, // 10% off
    minSpend: 0,
    description: '10% discount on entire order',
  },
  SAVE20: {
    code: 'SAVE20',
    type: 'flat',
    value: 20, // $20 off
    minSpend: 50,
    description: '$20 off on orders over $50',
  },
  FREESHIP: {
    code: 'FREESHIP',
    type: 'shipping',
    value: 10, // Free shipping
    minSpend: 0,
    description: 'Free standard shipping',
  },
  WELCOME50: {
    code: 'WELCOME50',
    type: 'flat',
    value: 50, // $50 off
    minSpend: 150,
    description: '$50 off on premium orders over $150',
  },
};

/**
 * @desc    Validate promotional coupon code
 * @route   POST /api/orders/validate-coupon
 * @access  Public
 */
const validateCoupon = async (req, res) => {
  try {
    const { code, itemsPrice = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ valid: false, message: 'Please enter a coupon code' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = PROMO_COUPONS[cleanCode];

    if (!coupon) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid promo code. Available codes: SHOPEASE10, SAVE20, FREESHIP, WELCOME50',
      });
    }

    const subtotal = Number(itemsPrice);

    if (coupon.minSpend > 0 && subtotal < coupon.minSpend) {
      return res.status(400).json({
        valid: false,
        message: `Promo code ${coupon.code} requires a minimum order subtotal of $${coupon.minSpend}. Current subtotal is $${subtotal.toFixed(2)}.`,
      });
    }

    let discountAmount = 0;
    if (coupon.type === 'percent') {
      discountAmount = Number(((subtotal * coupon.value) / 100).toFixed(2));
    } else if (coupon.type === 'flat') {
      discountAmount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'shipping') {
      discountAmount = 10; // shipping fee offset
    }

    res.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.type,
      discountValue: coupon.value,
      discountAmount,
      description: coupon.description,
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: error.message });
  }
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private (Logged-in customers)
 */
const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountAmount = 0,
      couponCode = '',
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city) {
      return res.status(400).json({ message: 'Please provide full shipping details' });
    }

    // If connected to MongoDB
    if (mongoose.connection.readyState === 1) {
      for (const item of orderItems) {
        if (mongoose.isValidObjectId(item.product)) {
          const product = await Product.findById(item.product);
          if (product) {
            if (product.countInStock < item.qty) {
              return res.status(400).json({
                message: `Not enough stock available for ${product.name}. Available: ${product.countInStock}`,
              });
            }
            product.countInStock = Math.max(0, product.countInStock - item.qty);
            await product.save();
          }
        }
      }

      const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        itemsPrice: Number(itemsPrice),
        shippingPrice: Number(shippingPrice) || 0,
        discountAmount: Number(discountAmount) || 0,
        couponCode: couponCode || '',
        totalPrice: Number(totalPrice),
        isPaid: false,
        status: 'Pending',
      });

      const createdOrder = await order.save();
      return res.status(201).json(createdOrder);
    }

    // In-memory fallback
    for (const item of orderItems) {
      const product = inMemoryStore.products.find(
        (p) => p._id.toString() === item.product.toString()
      );
      if (product) {
        if (product.countInStock < item.qty) {
          return res.status(400).json({
            message: `Not enough stock available for ${product.name}. Available: ${product.countInStock}`,
          });
        }
        product.countInStock = Math.max(0, product.countInStock - item.qty);
      }
    }

    const newOrder = {
      _id: `ord_${Date.now()}`,
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
      },
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      itemsPrice: Number(itemsPrice),
      shippingPrice: Number(shippingPrice) || 0,
      discountAmount: Number(discountAmount) || 0,
      couponCode: couponCode || '',
      totalPrice: Number(totalPrice),
      isPaid: false,
      status: 'Pending',
      createdAt: new Date(),
    };
    inMemoryStore.orders.unshift(newOrder);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Customer cancel order & restore product stock
 * @route   PUT /api/orders/:id/cancel
 * @access  Private (Order owner or Admin)
 */
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user._id.toString();

    // MongoDB connection active
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(orderId)) {
      const order = await Order.findById(orderId);
      if (order) {
        if (order.user.toString() !== userId && !req.user.isAdmin) {
          return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        if (order.status !== 'Pending') {
          return res.status(400).json({
            message: `Cannot cancel order with status '${order.status}'. Only 'Pending' orders can be cancelled.`,
          });
        }

        // Restore stock
        for (const item of order.orderItems) {
          if (mongoose.isValidObjectId(item.product)) {
            const product = await Product.findById(item.product);
            if (product) {
              product.countInStock += item.qty;
              await product.save();
            }
          }
        }

        order.status = 'Cancelled';
        const updatedOrder = await order.save();
        return res.json({ message: 'Order cancelled successfully and stock restored', order: updatedOrder });
      }
    }

    // In-memory fallback
    const order = inMemoryStore.orders.find((o) => o._id.toString() === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const orderOwnerId = (order.user?._id || order.user)?.toString();
    if (orderOwnerId !== userId && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'Pending') {
      return res.status(400).json({
        message: `Cannot cancel order with status '${order.status}'. Only 'Pending' orders can be cancelled.`,
      });
    }

    // Restore in-memory stock
    for (const item of order.orderItems) {
      const product = inMemoryStore.products.find(
        (p) => p._id.toString() === item.product.toString()
      );
      if (product) {
        product.countInStock += item.qty;
      }
    }

    order.status = 'Cancelled';
    res.json({ message: 'Order cancelled successfully and stock restored', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
      return res.json(orders);
    }

    const userId = req.user._id.toString();
    const userOrders = inMemoryStore.orders.filter(
      (o) => (o.user?._id || o.user)?.toString() === userId
    );
    res.json(userOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(req.params.id)) {
      const order = await Order.findById(req.params.id).populate('user', 'name email');
      if (order) {
        if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
          return res.status(403).json({ message: 'Not authorized to view this order' });
        }
        return res.json(order);
      }
    }

    const order = inMemoryStore.orders.find(
      (o) => o._id.toString() === req.params.id.toString()
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get all orders (Admin only)
 * @route   GET /api/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({})
        .populate('user', 'id name email')
        .sort({ createdAt: -1 });
      return res.json(orders);
    }

    res.json(inMemoryStore.orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update order delivery status (Admin only)
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, isPaid, isDelivered } = req.body;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Order not found' });

      if (status) order.status = status;
      if (isPaid !== undefined) {
        order.isPaid = isPaid;
        if (isPaid && !order.paidAt) order.paidAt = Date.now();
      }
      if (isDelivered !== undefined) {
        order.isDelivered = isDelivered;
        if (isDelivered && !order.deliveredAt) order.deliveredAt = Date.now();
      }

      const updatedOrder = await order.save();
      return res.json(updatedOrder);
    }

    const order = inMemoryStore.orders.find(
      (o) => o._id.toString() === req.params.id.toString()
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (status) order.status = status;
    if (isPaid !== undefined) order.isPaid = isPaid;
    if (isDelivered !== undefined) order.isDelivered = isDelivered;

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  validateCoupon,
  createOrder,
  cancelOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
