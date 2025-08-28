const express = require('express');
const router = express.Router();
const VoiceChat = require('../models/voicechat'); // matches the model export
const auth = require('../middleware/auth'); // your existing auth middleware

// 🔹 Start a voice chat
router.post('/', auth, async (req, res) => {
  try {
    const { user_2, duration } = req.body;
    if (!user_2) return res.status(400).json({ error: 'Recipient user is required' });

    const chat = await VoiceChat.create({ // use the imported model name
      user_1: req.user.id,
      user_2,
      duration
    });

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get all voice chats for a user
router.get('/mychats', auth, async (req, res) => {
  try {
    const chats = await VoiceChat.find({ // use the imported model name
      $or: [{ user_1: req.user.id }, { user_2: req.user.id }]
    })
      .populate('user_1', 'name email')
      .populate('user_2', 'name email');

    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
