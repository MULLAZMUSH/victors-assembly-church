const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  resume: { type: String, default: '' } // store file path or cloud URL
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
