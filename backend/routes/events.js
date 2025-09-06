const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth'); // Protect routes

// ------------------ Create an event (protected) ------------------
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, date } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });

    const event = await Event.create({
      title,
      description: description || '',
      date,
      creator: req.user.id
    });

    res.status(201).json({ message: 'Event created successfully', event });
  } catch (err) {
    console.error('Create event error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Get all events ------------------
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json({ count: events.length, events });
  } catch (err) {
    console.error('Fetch events error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Get a single event ------------------
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });

    res.json(event);
  } catch (err) {
    console.error('Fetch single event error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Update an event (protected, creator only) ------------------
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized: Only the creator can update this event' });

    const { title, description, date } = req.body;
    event.title = title || event.title;
    event.description = description || event.description;
    event.date = date || event.date;

    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    console.error('Update event error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ------------------ Delete an event (protected, creator only) ------------------
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    if (event.creator.toString() !== req.user.id)
      return res.status(403).json({ error: 'Unauthorized: Only the creator can delete this event' });

    await event.remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
