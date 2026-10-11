const mongoose = require('mongoose');
const Product = require('../models/Product');
const inMemoryStore = require('../data/inMemoryStore');

/**
 * @desc    Fetch all products with optional keyword, category search, and sorting
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const { keyword, category, sort } = req.query;

    if (mongoose.connection.readyState === 1) {
      const queryFilter = {};
      if (keyword) {
        queryFilter.name = { $regex: keyword.trim(), $options: 'i' };
      }
      if (category && category !== 'All') {
        queryFilter.category = category;
      }

      let sortOptions = { createdAt: -1 };
      if (sort === 'price-asc') sortOptions = { price: 1 };
      else if (sort === 'price-desc') sortOptions = { price: -1 };
      else if (sort === 'rating') sortOptions = { rating: -1 };
      else if (sort === 'newest') sortOptions = { createdAt: -1 };

      const products = await Product.find(queryFilter).sort(sortOptions);
      return res.json(products);
    }

    // In-memory fallback
    let filtered = [...inMemoryStore.products];
    if (keyword) {
      const kw = keyword.toLowerCase().trim();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.category.toLowerCase().includes(kw)
      );
    }
    if (category && category !== 'All') {
      filtered = filtered.filter((p) => p.category === category);
    }

    // Apply sorting in memory
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      // default / newest
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (product) return res.json(product);
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = inMemoryStore.products.find(
      (p) => p._id.toString() === req.params.id.toString()
    );
    if (product) return res.json(product);
    res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a product review
 * @route   POST /api/products/:id/reviews
 * @access  Private (Logged-in customer)
 */
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const numRating = Number(rating);

    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Please provide a valid rating between 1 and 5' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'Please provide a comment for your review' });
    }

    const reviewerId = req.user._id.toString();
    const reviewerName = req.user.name || 'Anonymous Customer';

    // MongoDB connection active
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (!product.reviews) {
        product.reviews = [];
      }

      // Check if user already reviewed
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === reviewerId
      );

      if (alreadyReviewed) {
        alreadyReviewed.rating = numRating;
        alreadyReviewed.comment = comment.trim();
        alreadyReviewed.updatedAt = new Date();
      } else {
        const review = {
          user: req.user._id,
          name: reviewerName,
          rating: numRating,
          comment: comment.trim(),
        };
        product.reviews.push(review);
      }

      product.numReviews = product.reviews.length;
      product.rating = Number(
        (
          product.reviews.reduce((acc, item) => item.rating + acc, 0) /
          product.reviews.length
        ).toFixed(1)
      );

      await product.save();
      return res.status(201).json({
        message: alreadyReviewed ? 'Review updated successfully' : 'Review added successfully',
        product,
      });
    }

    // In-memory fallback
    const product = inMemoryStore.products.find(
      (p) => p._id.toString() === req.params.id.toString()
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.reviews) {
      product.reviews = [];
    }

    const existingReviewIndex = product.reviews.findIndex(
      (r) => (r.user?.toString() || r.user) === reviewerId
    );

    const reviewObj = {
      _id: `rev_${Date.now()}`,
      user: reviewerId,
      name: reviewerName,
      rating: numRating,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    };

    if (existingReviewIndex !== -1) {
      product.reviews[existingReviewIndex] = {
        ...product.reviews[existingReviewIndex],
        ...reviewObj,
      };
    } else {
      product.reviews.unshift(reviewObj);
    }

    product.numReviews = product.reviews.length;
    product.rating = Number(
      (
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length
      ).toFixed(1)
    );

    res.status(201).json({
      message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create a new product (Admin only)
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, countInStock } = req.body;

    if (!name || price === undefined || !description || !category || countInStock === undefined) {
      return res.status(400).json({ message: 'Please provide all required product fields' });
    }

    if (mongoose.connection.readyState === 1) {
      const product = new Product({
        name,
        price: Number(price),
        description,
        category,
        image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        countInStock: Number(countInStock),
        rating: 4.5,
        numReviews: 0,
        reviews: [],
      });
      const createdProduct = await product.save();
      return res.status(201).json(createdProduct);
    }

    const newProd = {
      _id: `prod_${Date.now()}`,
      name,
      price: Number(price),
      description,
      category,
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
      countInStock: Number(countInStock),
      rating: 4.5,
      numReviews: 0,
      reviews: [],
      createdAt: new Date(),
    };
    inMemoryStore.products.unshift(newProd);
    res.status(201).json(newProd);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update an existing product (Admin only)
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, image, countInStock } = req.body;

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });

      product.name = name !== undefined ? name : product.name;
      product.price = price !== undefined ? Number(price) : product.price;
      product.description = description !== undefined ? description : product.description;
      product.category = category !== undefined ? category : product.category;
      product.image = image !== undefined ? image : product.image;
      product.countInStock = countInStock !== undefined ? Number(countInStock) : product.countInStock;

      const updatedProduct = await product.save();
      return res.json(updatedProduct);
    }

    const idx = inMemoryStore.products.findIndex(
      (p) => p._id.toString() === req.params.id.toString()
    );
    if (idx === -1) return res.status(404).json({ message: 'Product not found' });

    const p = inMemoryStore.products[idx];
    inMemoryStore.products[idx] = {
      ...p,
      name: name !== undefined ? name : p.name,
      price: price !== undefined ? Number(price) : p.price,
      description: description !== undefined ? description : p.description,
      category: category !== undefined ? category : p.category,
      image: image !== undefined ? image : p.image,
      countInStock: countInStock !== undefined ? Number(countInStock) : p.countInStock,
    };
    res.json(inMemoryStore.products[idx]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete a product (Admin only)
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      await Product.findByIdAndDelete(req.params.id);
      return res.json({ message: 'Product successfully removed' });
    }

    const idx = inMemoryStore.products.findIndex(
      (p) => p._id.toString() === req.params.id.toString()
    );
    if (idx === -1) return res.status(404).json({ message: 'Product not found' });

    inMemoryStore.products.splice(idx, 1);
    res.json({ message: 'Product successfully removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
};
