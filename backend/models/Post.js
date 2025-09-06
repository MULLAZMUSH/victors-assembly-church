// backend/models/Post.js
const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true }, // ✅ was "body"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ was "author"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
