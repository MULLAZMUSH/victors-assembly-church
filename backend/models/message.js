const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    }
  },
  { timestamps: true } // automatically adds createdAt and updatedAt
);

module.exports = mongoose.model('message', messageSchema);
