const express = require('express');
const router = express.Router();
const VoiceChat = require('../models/VoiceChat'); // match the filename exactly!
const auth = require('../middleware/auth'); // your existing auth middleware

// 🔹 Start a voice chat
router.post('/', auth, async (req, res) => {
  try {
    const { user_2, duration } = req.body;
    if (!user_2) return res.status(400).json({ error: 'Recipient user is required' });

    const chat = await VoiceChat.create({
      user_1: req.user.id,
      user_2,
      duration
    });

    res.status(201).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get all voice chats for a user
router.get('/mychats', auth, async (req, res) => {
  try {
    const chats = await VoiceChat.find({
      $or: [{ user_1: req.user.id }, { user_2: req.user.id }]
    })
      .populate('user_1', 'name emails picture')
      .populate('user_2', 'name emails picture');

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
