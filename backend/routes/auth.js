// backend/routes/auth.js
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User'); // Ensure correct capitalization
require('dotenv').config();

const router = express.Router();

// ───── Rate Limiting ─────
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many signup attempts from this IP, please try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 20,
  message: 'Too many login attempts, please try again later.'
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: 'Too many password reset requests, please try again later.'
});

// ───── Async Handler Wrapper ─────
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ───── Routes ─────

// POST /register
router.post('/register', registerLimiter, asyncHandler(async (req, res) => {
  const { name, emails, password, picture } = req.body;
  if (!name || !emails || !password || !Array.isArray(emails) || emails.length === 0)
    return res.status(400).json({ error: 'All fields are required and emails must be an array' });

  // Check if any email already exists
  const existingUser = await User.findOne({ emails: { $in: emails } });
  if (existingUser) return res.status(400).json({ error: 'One of the emails is already in use' });

  const user = await User.create({ name, emails, password, picture, verified: false });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${token}`;
  console.log(`✅ Verify link for ${emails.join(', ')}: ${url}`);

  res.json({ message: 'Registration successful! Check server logs for verification link.' });
}));

// GET /verify/:token
router.get('/verify/:token', asyncHandler(async (req, res) => {
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  await User.findByIdAndUpdate(decoded.id, { verified: true });
  res.send('Email verified successfully! You can now log in.');
}));

// POST /login
router.post('/login', loginLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  // Find user that has this email
  const user = await User.findOne({ emails: email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.verified)
    return res.status(403).json({ error: 'Please verify your email first' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ 
    token, 
    user: { id: user._id, name: user.name, emails: user.emails, picture: user.picture } 
  });
}));

// POST /forgot-password
router.post('/forgot-password', forgotPasswordLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ emails: email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  console.log(`🔑 Password reset link for ${email}: ${url}`);

  res.json({ message: 'Password reset link generated. Check server logs.' });
}));

// POST /reset-password/:token
router.post('/reset-password/:token', asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password = req.body.password; // hashed via schema middleware
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
}));

module.exports = router;
