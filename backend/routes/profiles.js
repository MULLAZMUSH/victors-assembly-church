// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const profile = require('../models/profile');
const auth = require('../middleware/auth'); // Protect routes
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ------------------ Multer setup for profile picture uploads ------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/profiles/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// ------------------ Create or Update Profile ------------------
router.post('/', auth, upload.single('picture'), async (req, res) => {
  try {
    const { bio, skills } = req.body;
    const profileFields = {
      user: req.user.id,
      bio: bio || '',
      skills: skills ? skills.split(',').map(s => s.trim()) : []
    };

    if (req.file) profileFields.picture = req.file.path;

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Update existing
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create new profile
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ------------------ Get profile by user ID ------------------
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'emails', 'picture']);
    if (!profile) return res.status(404).json({ msg: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// ------------------ Get all profiles ------------------
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'emails', 'picture']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
