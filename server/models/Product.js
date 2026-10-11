const mongoose = require('mongoose');

/**
 * Review Schema:
 * Handles customer rating (1-5 stars) and feedback comments
 */
const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Product Schema:
 * Stores catalog items, pricing, inventory stock, reviews, and categories.
 */
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be greater than or equal to 0'],
      default: 0,
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    },
    countInStock: {
      type: Number,
      required: [true, 'Count in stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    rating: {
      type: Number,
      required: true,
      default: 4.5,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
  }
);

// Search index for fast text searches on name and category
productSchema.index({ name: 'text', category: 'text' });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
