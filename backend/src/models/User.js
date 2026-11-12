const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    matricNumber: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, required: true, trim: true },
    profilePicture: { type: String, default: null},
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isDriver: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false,},
    resetOTP: { type: String, default: null,},
    resetOTPExpiry: { type: Date, default: null,},
    resetOTPAttempts: { type: Number, default: 0,},
    resetVerified: { type: Boolean, default: false,},
    resetVerifiedExpiry: { type: Date, default: null,},},
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);