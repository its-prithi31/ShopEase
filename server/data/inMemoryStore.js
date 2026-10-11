const bcrypt = require('bcryptjs');
const sampleProducts = require('./sampleProducts');

/**
 * In-Memory Database Store:
 * Serves as an instant zero-configuration data store when MongoDB
 * is not running locally. Automatically populates sample products
 * and demo credentials.
 */

const salt = bcrypt.genSaltSync(10);

const users = [
  {
    _id: 'user_admin_001',
    name: 'Admin User',
    email: 'admin@shopease.com',
    password: bcrypt.hashSync('admin123', salt),
    isAdmin: true,
    createdAt: new Date(),
  },
  {
    _id: 'user_cust_002',
    name: 'John Doe',
    email: 'user@shopease.com',
    password: bcrypt.hashSync('user123', salt),
    isAdmin: false,
    createdAt: new Date(),
  },
];

const products = sampleProducts.map((p, idx) => ({
  _id: `prod_sample_00${idx + 1}`,
  name: p.name,
  description: p.description,
  price: p.price,
  category: p.category,
  image: p.image,
  countInStock: p.countInStock,
  rating: p.rating,
  numReviews: p.numReviews || (p.reviews ? p.reviews.length : 0),
  reviews: p.reviews ? [...p.reviews] : [],
  createdAt: new Date(),
}));

const orders = [];

module.exports = {
  users,
  products,
  orders,
};
