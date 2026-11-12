const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    seats: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ride', rideSchema);