const jwt = require('jsonwebtoken');
require('dotenv').config();
const TokenStore = require('../models/tokenStore'); // You’ll create this model or use Redis

const auth = async (req, res, next) => {
  try {
    const token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Token reuse protection
    const tokenExists = await TokenStore.findOne({ token });
    if (!tokenExists) {
      return res.status(401).json({ error: 'Token is invalid or has been revoked' });
    }

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = auth;