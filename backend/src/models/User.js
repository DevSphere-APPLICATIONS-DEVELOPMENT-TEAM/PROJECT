const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    matricNumber: { type: String, required: true, unique: true, trim: true },
    gender: { type: String, enum: ['male', 'female', 'prefer_not_to_say'], default: null },
    phone: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: null},
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isDriver: { type: Boolean, default: false },
    resetOTP: { type: String, default: null },
    resetOTPExpiry: { type: Date, default: null },
    resetOTPAttempts: { type: Number, default: 0 },
    resetVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);