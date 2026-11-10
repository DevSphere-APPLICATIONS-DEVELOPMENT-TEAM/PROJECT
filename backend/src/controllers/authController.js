
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

// REGISTER
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      matricNumber,
      phone
    } = req.body;

    // Check required fields
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

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'Email is already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      matricNumber,
      phone
    });

    // Generate token
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

    // Find user
    const user = await User.findOne({
      email: normalizedEmail
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate token
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

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ user });

  } catch (error) {
    res.status(500).json({
      message: "Unable to retrieve profile",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
};

