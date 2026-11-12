const Ride = require('../models/Ride');

const publishRide = async (req, res) => {
  try {
    const { driver, origin, destination, date, seats, price } = req.body;

    // Check required fields
    if (!driver || !origin || !destination || !date || !seats || price === undefined) {
      return res.status(400).json({
        message: 'All fields (driver, origin, destination, date, seats, price) are required'
      });
    }

    // Create ride
    const ride = await Ride.create({
      driver,
      origin,
      destination,
      date,
      seats,
      price
    });

    res.status(201).json({
      message: 'Ride published successfully',
      ride
    });

  } catch (error) {
    console.error('Publish ride error:', error);
    res.status(500).json({
      message: 'Failed to publish ride'
    });
  }
};

module.exports = {
  publishRide
};