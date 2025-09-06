const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// ------------------ Create a new post (protected) ------------------
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const newPost = await Post.create({
      title,
      content,
      user: req.user.id,
    });

    const populated = await newPost.populate('user', ['name', 'email']);
    res.status(201).json(populated);
  } catch (err) {
    console.error('Create Post Error:', err.message);
    res.status(500).json({ error: 'Server error while creating post' });
  }
});

// ------------------ Get all posts (public) ------------------
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('user', ['name', 'email'])
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Get Posts Error:', err.message);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
});

// ------------------ Get a single post by ID (public) ------------------
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('user', ['name', 'email']);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error('Get Single Post Error:', err.message);
    res.status(500).json({ error: 'Server error while fetching post' });
  }
});

// ------------------ Get my posts (protected) ------------------
router.get('/me', auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate('user', ['name', 'email'])
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('Get My Posts Error:', err.message);
    res.status(500).json({ error: 'Server error while fetching your posts' });
  }
});

// ------------------ Update a post (protected) ------------------
router.put('/:id', auth, async (req, res) => {
  const { title, content } = req.body;

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to update this post' });
    }

    post.title = title || post.title;
    post.content = content || post.content;
    await post.save();

    const populated = await post.populate('user', ['name', 'email']);
    res.json(populated);
  } catch (err) {
    console.error('Update Post Error:', err.message);
    res.status(500).json({ error: 'Server error while updating post' });
  }
});

// ------------------ Delete a post (protected) ------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete Post Error:', err.message);
    res.status(500).json({ error: 'Server error while deleting post' });
  }
});

module.exports = router;
module.exports = router;