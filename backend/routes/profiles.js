const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile'); // ✅ Capitalized model name
const auth = require('../middleware/auth');
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
    if (!req.user || !req.user.id) return cb(new Error('Missing user ID'));
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

// ------------------ Create or Update Profile ------------------
router.post('/', auth, upload.single('picture'), async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info' });
    }

    const { bio, skills } = req.body;
    const profileFields = {
      user: req.user.id,
      bio: bio || '',
      skills: skills ? skills.split(',').map(s => s.trim()) : []
    };

    if (req.file) profileFields.picture = req.file.path;

    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);

  } catch (err) {
    console.error('Profile creation/update error:', err.message);
    res.status(500).json({ message: 'Server error while saving profile' });
  }
});

// ------------------ Get profile by user ID ------------------
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', ['name', 'email', 'picture']); // ✅ 'email' not 'emails'

    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    console.error('Get profile by ID error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------ Get all profiles ------------------
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'email', 'picture']);
    res.json(profiles);
  } catch (err) {
    console.error('Get all profiles error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;