const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    pickup: {
      type: String,
      required: true,
      trim: true,
    },

    destination: {
      type: String,
      required: true,
      trim: true,
    },

    departureDate: {
      type: String,
      required: true,
    },

    departureTime: {
      type: String,
      required: true,
    },

    departureAt: {
      type: Date,
      default: null,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    femalePassengersOnly: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
      default: 'pending',
    },

    adminRemarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);
