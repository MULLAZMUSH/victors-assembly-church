const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ------------------ Multer setup for profile picture uploads ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/profiles/');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowedTypes.test(ext) && allowedTypes.test(mime)) cb(null, true);
    else cb(new Error('Only JPEG/PNG images are allowed'));
  }
});

// ------------------ Get current user's profile (protected) ------------------
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'picture']);
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('GET /profile/me error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ------------------ Create or Update Profile ------------------
router.post('/', auth, upload.single('picture'), async (req, res) => {
  try {
    const { bio, skills } = req.body;

    const profileFields = {
      user: req.user.id,
      bio: bio || '',
      skills: skills ? skills.split(',').map(s => s.trim()) : []
    };

    if (req.file) {
      // Store relative path for frontend access
      profileFields.picture = `/uploads/profiles/${req.file.filename}`;
    }

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, upsert: true }
      );
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error('POST /profile error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ------------------ Get profile by user ID ------------------
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'email', 'picture']);
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('GET /profile/:userId error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ------------------ Get all profiles ------------------
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'email', 'picture']);
    res.json(profiles);
  } catch (err) {
    console.error('GET /profile error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
