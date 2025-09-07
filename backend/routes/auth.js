const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
let TokenStore;

try {
  TokenStore = require('../models/tokenStore'); // Optional
} catch (err) {
  console.warn('⚠️ TokenStore model not found. Refresh tokens will not be persisted.');
}

require('dotenv').config();
const router = express.Router();

// ───── Rate Limiting ─────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many signup attempts, please try again later.' }
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, please try again later.' }
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many password reset requests, please try again later.' }
});

// ───── Async Handler ─────
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// ───── Health Check ─────
router.get('/test-auth', (req, res) => {
  res.json({
    message: "Auth module is reachable!",
    routes: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      forgotPassword: "POST /api/auth/forgot-password",
      resetPassword: "POST /api/auth/reset-password/:token",
      verifyEmail: "GET /api/auth/verify/:token",
      refreshToken: "POST /api/auth/refresh"
    }
  });
});

// ───── POST /register ─────
router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ error: 'Email already in use' });

  const user = await User.create({ name, email, password, picture, verified: false });

  // Create email verification token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;

  console.log(`✅ User registered: ${email}`);
  console.log(`🔗 Verification link: ${verifyUrl}`);

  res.json({ message: 'Registration successful! Check email for verification link.' });
}));

// ───── GET /verify/:token ─────
router.get('/verify/:token', asyncHandler(async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.verified) return res.json({ message: 'Email already verified.' });

    user.verified = true;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
}));

// ───── POST /login ─────
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  if (!user.verified) return res.status(403).json({ error: 'Please verify your email first' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

  // Optional: save tokens if TokenStore exists
  if (TokenStore) {
    await TokenStore.create({ token, userId: user._id, type: 'access', expiresAt: Date.now() + 15 * 60 * 1000 });
    await TokenStore.create({ token: refreshToken, userId: user._id, type: 'refresh', expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 });
  }

  res.json({
    token,
    refreshToken,
    user: { id: user._id, name: user.name, email: user.email, picture: user.picture }
  });
}));

// ───── POST /refresh ─────
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token is required' });

  try {
    if (TokenStore) {
      const tokenExists = await TokenStore.findOne({ token: refreshToken, type: 'refresh' });
      if (!tokenExists) return res.status(401).json({ error: 'Refresh token invalid or revoked' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    if (TokenStore) {
      await TokenStore.create({ token: newToken, userId: user._id, type: 'access', expiresAt: Date.now() + 15 * 60 * 1000 });
    }

    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}));

// ───── POST /forgot-password ─────
router.post('/forgot-password', forgotPasswordLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const resetToken = user.generatePasswordReset();
  await user.save();

  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  console.log(`🔑 Password reset link for ${email}: ${url}`);

  res.json({ message: 'Password reset link generated. Check your email.' });
}));

// ───── POST /reset-password/:token ─────
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: 'Password is required' });

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
}));

module.exports = router;
