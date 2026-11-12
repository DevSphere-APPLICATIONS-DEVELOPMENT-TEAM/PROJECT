
const Ride = require('../models/Ride');
const User = require('../models/User');
const DriverApplication = require('../models/DriverApplication');

// Driver publishes a ride
const publishRide = async (req, res) => {
  try {
    const {
      pickup,
      destination,
      departureDate,
      departureTime,
      seats,
      cost,
    } = req.body;

    if (
      !pickup ||
      !destination ||
      !departureDate ||
      !departureTime ||
      seats === undefined ||
      cost === undefined
    ) {
      return res.status(400).json({
        message: 'Please fill in all ride details.',
      });
    }

    if (
      !Number.isInteger(Number(seats)) ||
      Number(seats) < 1 ||
      !Number.isFinite(Number(cost)) ||
      Number(cost) < 0
    ) {
      return res.status(400).json({
        message: 'Invalid seats or cost.',
      });
    }

    // Only approved drivers can publish rides
    const driverApplication = await DriverApplication.findOne({
      userId: req.user.id,
      status: 'approved',
    });

    const user = await User.findById(req.user.id);

    if (!driverApplication || !user || !user.isDriver) {
      return res.status(403).json({
        message: 'You must be an approved driver to publish a ride.',
      });
    }

    // Save ride as approved immediately
    const ride = await Ride.create({
      driverId: req.user.id,
      pickup,
      destination,
      departureDate,
      departureTime,
      seats: Number(seats),
      cost: Number(cost),
      status: 'approved',
    });

    res.status(201).json({
      message: 'Ride published successfully!',
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Passengers view available rides
const getApprovedRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      status: 'approved',
    })
      .populate('driverId', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Driver views their own rides
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({
      driverId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Driver cancels their own ride
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      driverId: req.user.id,
    });

    if (!ride) {
      return res.status(404).json({
        message: 'Ride not found.',
      });
    }

    if (
      ride.status === 'cancelled' ||
      ride.status === 'completed' ||
      ride.status === 'rejected'
    ) {
      return res.status(400).json({
        message: 'This ride cannot be cancelled.',
      });
    }

    ride.status = 'cancelled';
    await ride.save();

    res.status(200).json({
      message: 'Ride cancelled successfully!',
      ride,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  publishRide,
  getApprovedRides,
  getMyRides,
  cancelRide,
};
