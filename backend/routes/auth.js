// backend/routes/auth.js
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// ───── Rate Limiting ─────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many signup attempts from this IP, please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many login attempts, please try again later.'
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests, please try again later.'
});

// ───── Async Handler ─────
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ───── Test Auth Endpoint ─────
router.get('/test-auth', (req, res) => {
  res.json({
    message: "Auth module is reachable!",
    routes: {
      register: "/api/auth/register [POST]",
      login: "/api/auth/login [POST]",
      forgotPassword: "/api/auth/forgot-password [POST]",
      resetPassword: "/api/auth/reset-password/:token [POST]",
      verifyEmail: "/api/auth/verify/:token [GET]"
    }
  });
});

// ───── Health / Test Endpoint ─────
router.get('/', (req, res) => {
  res.json({ message: 'Auth API is working!' });
});

// ───── POST /register ─────
router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const { name, emails, password, picture } = req.body;
  if (!name || !emails || !password || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'All fields are required and emails must be an array' });
  }

  const existingUser = await User.findOne({ emails: { $in: emails } });
  if (existingUser) return res.status(400).json({ error: 'One of the emails is already in use' });

  const user = await User.create({ name, emails, password, picture, verified: false });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;
  console.log(`✅ Verification link for ${emails.join(', ')}: ${url}`);

  res.json({ message: 'Registration successful! Check server logs for verification link.' });
}));

// ───── GET /verify/:token ─────
router.get('/verify/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  if (!token) return res.status(400).send('Token is required');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('User not found');

    if (user.verified) return res.send('Email already verified.');

    user.verified = true;
    await user.save();
    res.send('Email verified successfully! You can now log in.');
  } catch (err) {
    console.error('Verify token error:', err.message);
    res.status(400).send('Invalid or expired token');
  }
}));

// ───── POST /login ─────
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const user = await User.findOne({ emails: email }).select('+password');
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ error: 'Invalid credentials' });
  if (!user.verified) return res.status(403).json({ error: 'Please verify your email first' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user._id, name: user.name, emails: user.emails, picture: user.picture } });
}));

// ───── POST /forgot-password ─────
router.post('/forgot-password', forgotPasswordLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const user = await User.findOne({ emails: email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save();

  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  console.log(`🔑 Password reset link for ${email}: ${url}`);

  res.json({ message: 'Password reset link generated. Check server logs.' });
}));

// ───── POST /reset-password/:token ─────
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!token) return res.status(400).json({ message: 'Token is required' });
  if (!password) return res.status(400).json({ message: 'Password is required' });

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = password; // will be hashed via schema middleware
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
}));

module.exports = router;
