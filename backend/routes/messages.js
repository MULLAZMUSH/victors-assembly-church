// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const message = require('../models/message');
const auth = require('../middleware/auth');

// ------------------ Send a message (protected) ------------------
router.post('/', auth, async (req, res) => {
  const { title, body, recipient } = req.body;
  if (!title || !body || !recipient)
    return res.status(400).json({ error: 'Title, body, and recipient are required' });

  try {
    const message = await Message.create({
      title,
      body,
      sender: req.user.id,
      recipient
    });
    const populated = await message.populate('sender', ['name', 'email']).populate('recipient', ['name', 'email']);
    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Get inbox messages for logged-in user (protected) ------------------
router.get('/inbox', auth, async (req, res) => {
  try {
    const messages = await Message.find({ recipient: req.user.id })
      .populate('sender', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Get sent messages for logged-in user (protected) ------------------
router.get('/sent', auth, async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id })
      .populate('recipient', ['name', 'email'])
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Update a message (protected, sender only) ------------------
router.put('/:id', auth, async (req, res) => {
  const { title, body } = req.body;
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    message.title = title || message.title;
    message.body = body || message.body;
    await message.save();
    const populated = await message.populate('sender', ['name', 'email']).populate('recipient', ['name', 'email']);
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Delete a message (protected, sender only) ------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await message.remove();
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
