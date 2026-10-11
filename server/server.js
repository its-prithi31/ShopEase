const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check / API Welcome Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'ShopEase Mobile E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

// Mount REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Fallback & Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ShopEase Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
