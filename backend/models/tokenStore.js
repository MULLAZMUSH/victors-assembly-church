const mongoose = require("mongoose");

const tokenStoreSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["access", "refresh"], default: "access" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Automatically delete expired tokens (TTL index)
tokenStoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("TokenStore", tokenStoreSchema);
