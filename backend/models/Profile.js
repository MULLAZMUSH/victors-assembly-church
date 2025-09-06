const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bio: String,
  skills: [String],
  picture: String
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
