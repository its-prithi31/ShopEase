const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get products; Admin route to create product
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

// Public route to get single product; Admin routes to update & delete
router.route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Customer review route
router.route('/:id/reviews')
  .post(protect, createProductReview);

module.exports = router;
