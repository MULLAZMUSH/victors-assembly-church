// backend/models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    
    // Multiple emails support
    emails: [
      {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
      }
    ],

    password: { type: String, required: true, select: false },
    bio: { type: String, default: "" },
    verified: { type: Boolean, default: false },
    
    // Profile picture
    picture: { type: String, default: null },

    // Password reset fields
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword) throw new Error("Candidate password is missing.");
  if (!this.password) throw new Error("User password is not set.");
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
UserSchema.methods.generatePasswordReset = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token before saving in DB
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

  return resetToken; // raw token to send via email
};

// Remove sensitive fields in JSON responses
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
