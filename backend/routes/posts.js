// backend/routes/posts.js
const express = require('express');
const router = express.Router();
const post = require('../models/post');
const auth = require('../middleware/auth');

// ------------------ Create a new post (protected) ------------------
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  try {
    const post = await Post.create({
      title,
      content,
      user: req.user.id
    });
    const populated = await post.populate('user', ['name', 'email']);
    res.status(201).json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Get all posts (public) ------------------
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', ['name', 'email']).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Get my posts (protected) ------------------
router.get('/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).populate('user', ['name', 'email']).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Update a post (protected) ------------------
router.put('/:id', auth, async (req, res) => {
  const { content } = req.body;
  try {
    let post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    post.content = content || post.content;
    await post.save();
    const populated = await post.populate('user', ['name', 'email']);
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Delete a post (protected) ------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await post.remove();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
