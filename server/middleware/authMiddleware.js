const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const inMemoryStore = require('../data/inMemoryStore');

/**
 * Authentication Middleware:
 * Verifies JWT token sent in HTTP Authorization header (Bearer <token>).
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(decoded.id)) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (dbErr) {
          console.warn('DB user lookup error:', dbErr.message);
        }
      }

      if (!req.user) {
        const found = inMemoryStore.users.find(
          (u) => u._id.toString() === decoded.id.toString()
        );
        req.user = found
          ? {
              _id: found._id,
              name: found.name,
              email: found.email,
              isAdmin: found.isAdmin,
            }
          : null;
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not found for this token' });
      }

      return next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

/**
 * Admin Middleware:
 * Restricts access to admin-only routes.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
  }
};

module.exports = { protect, admin };
