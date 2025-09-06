// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
const TokenStore = require('../models/tokenStore'); // Make sure this model exists or replace with Redis

const auth = async (req, res, next) => {
  try {
    // 🔹 Extract token from Authorization or custom header
    const token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET is missing in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // 🔹 Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('❌ JWT verification failed:', err.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // 🔹 Token reuse protection
    const tokenExists = await TokenStore.findOne({ token });
    if (!tokenExists) {
      return res.status(401).json({ error: 'Token is invalid or has been revoked' });
    }

    // 🔹 Attach user info to request
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = auth;
