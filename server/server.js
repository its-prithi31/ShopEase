const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from server/.env and root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Fallback JWT secret for instant zero-config deployment / local execution
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'shopease_default_jwt_secret_dev_key_2026';
}

// Connect to MongoDB
connectDB();

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Client Web Build if present
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// API Router
const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'ShopEase Mobile & Web E-Commerce API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/products', productRoutes);
apiRouter.use('/orders', orderRoutes);

// Mount on standard /api as well as Netlify serverless function path
app.use('/api', apiRouter);
app.use('/.netlify/functions/api', apiRouter);

// Single Page Application (SPA) fallback:
// Any GET request not matching /api returns the Web client index.html (or API status if no web build exists)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/.netlify/functions')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.json({
    status: 'online',
    app: 'ShopEase E-Commerce API',
    version: '1.0.0',
    message: 'Backend is running. Build the web client (npm run build) to serve the frontend here.',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      orders: '/api/orders',
    },
  });
});

// Fallback & Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start listener if not running in serverless environment (e.g., Vercel, Netlify, AWS Lambda) or tests
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL && !process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`🚀 ShopEase Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

module.exports = app;
