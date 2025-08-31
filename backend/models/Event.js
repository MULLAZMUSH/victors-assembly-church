// backend/models/Event.js
const mongoose = require('mongoose');

// ───── Event Schema ─────
const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    location: { type: String, default: 'Online / TBD' },
    recurring: { 
      type: String, 
      enum: ['none', 'daily', 'weekly', 'monthly'], 
      default: 'none' 
    },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notifyUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

// ───── Export Model ─────
module.exports = mongoose.model('Event', EventSchema);
