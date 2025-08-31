const mongoose = require('mongoose');

const voiceChatSchema = new mongoose.Schema({
  user_1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user_2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number } // in seconds
}, { timestamps: true });

// Export the model with exact capitalization
module.exports = mongoose.model('VoiceChat', voiceChatSchema);
