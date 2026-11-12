
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Temporary cooldown and verification expiry storage
const otpCooldowns = new Map();
const resetVerificationExpiries = new Map();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, matricNumber, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      matricNumber,
      phone
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber,
        phone: user.phone,
        isDriver: user.isDriver,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    res.status(500).json({
      message: 'Registration failed'
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        matricNumber: user.matricNumber,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isDriver: user.isDriver,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'Login failed'
    });
  }
};

// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({ user });

  } catch (error) {
    res.status(500).json({
      message: 'Unable to retrieve profile'
    });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const { name, phone, profilePicture } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);

    res.status(500).json({
      message: 'Unable to update profile'
    });
  }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    const now = Date.now();
    const lastSent = otpCooldowns.get(email);

    if (lastSent && now - lastSent < 50000) {
      const remaining = Math.ceil(
        (50000 - (now - lastSent)) / 1000
      );

      return res.status(429).json({
        message: `Please wait ${remaining} seconds before requesting another OTP.`
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: 'Email not found.'
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(now + 5 * 60 * 1000);
    user.resetOTPAttempts = 0;
    user.resetVerified = false;

    await user.save();

    try {
      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Campus Ride - Password Reset OTP',
        text: `Your OTP is ${otp}. It expires in 5 minutes. Do not share this code.`
      });

      otpCooldowns.set(email, now);
      resetVerificationExpiries.delete(email);

    } catch (emailError) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      await user.save();
      throw emailError;
    }

    res.json({
      message: 'OTP sent to your email.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      message: 'Failed to send OTP.'
    });
  }
};

// VERIFY OTP
const verifyResetOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required'
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.resetOTP) {
      return res.status(400).json({
        message: 'Invalid OTP.'
      });
    }

    if (!user.resetOTPExpiry ||
        user.resetOTPExpiry < new Date()) {
      return res.status(400).json({
        message: 'OTP has expired.'
      });
    }

    if (user.resetOTPAttempts >= 5) {
      return res.status(429).json({
        message: 'Too many attempts. Request a new OTP.'
      });
    }

    if (user.resetOTP !== otp.toString()) {
      user.resetOTPAttempts += 1;
      await user.save();

      return res.status(400).json({
        message: 'Incorrect OTP.'
      });
    }

    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.resetOTPAttempts = 0;
    user.resetVerified = true;

    await user.save();

    resetVerificationExpiries.set(
      email,
      Date.now() + 10 * 60 * 1000
    );

    res.json({
      message: 'OTP verified successfully.'
    });

  } catch (error) {
    console.error('OTP verification error:', error);

    res.status(500).json({
      message: 'OTP verification failed.'
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        message: 'Email and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters.'
      });
    }

    const user = await User.findOne({ email });

    const verificationExpiry = resetVerificationExpiries.get(email);

    if (
      !user ||
      user.resetVerified !== true ||
      !verificationExpiry ||
      verificationExpiry < Date.now()
    ) {
      return res.status(400).json({
        message: 'Please verify your OTP first.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);

    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.resetOTPAttempts = 0;
    user.resetVerified = false;

    await user.save();

    resetVerificationExpiries.delete(email);

    res.json({
      message: 'Password reset successfully.'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      message: 'Password reset failed.'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  verifyResetOTP,
  resetPassword
};
