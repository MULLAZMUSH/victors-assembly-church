const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: { type: Date, required: true },
  location: { type: String, default: 'Online / TBD' }, // optional
  recurring: { type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' }, // recurring events
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notifyUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // users to notify
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
