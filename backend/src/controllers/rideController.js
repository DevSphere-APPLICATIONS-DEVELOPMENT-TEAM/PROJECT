
const Ride = require('../models/Ride');
const User = require('../models/User');
const DriverApplication = require('../models/DriverApplication');

/**
 * Parse departureDate (DD/MM/YYYY) + departureTime (e.g. "8:00 AM")
 * into a JS Date assumed to be in Asia/Kuala_Lumpur (UTC+8).
 */
const parseDepartureStrings = (dateStr, timeStr) => {
  const dateParts = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!dateParts) return null;

  const [, dd, mm, yyyy] = dateParts;

  const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) return null;

  let [, hh, min, period] = timeMatch;
  hh = Number(hh);
  min = Number(min);

  if (period.toUpperCase() === 'PM' && hh !== 12) hh += 12;
  if (period.toUpperCase() === 'AM' && hh === 12) hh = 0;

  // Build ISO string in UTC+8
  const pad = (n) => String(n).padStart(2, '0');
  const iso = `${yyyy}-${pad(mm)}-${pad(dd)}T${pad(hh)}:${pad(min)}:00+08:00`;
  const parsed = new Date(iso);

  return isNaN(parsed.getTime()) ? null : parsed;
};

// Driver publishes a ride
const publishRide = async (req, res) => {
  try {
    const {
      pickup,
      destination,
      departureDate,
      departureTime,
      departureAt,
      seats,
      cost,
      femalePassengersOnly,
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

    // Resolve the canonical departure timestamp
    let resolvedDepartureAt = null;

    if (departureAt) {
      resolvedDepartureAt = new Date(departureAt);
      if (isNaN(resolvedDepartureAt.getTime())) {
        return res.status(400).json({
          message: 'Invalid departure date/time.',
        });
      }
    } else {
      resolvedDepartureAt = parseDepartureStrings(departureDate, departureTime);
      if (!resolvedDepartureAt) {
        return res.status(400).json({
          message: 'Invalid departure date/time format. Use DD/MM/YYYY and h:mm AM/PM.',
        });
      }
    }

    // Departure must be in the future
    if (resolvedDepartureAt <= new Date()) {
      return res.status(400).json({
        message: 'Departure date and time must be in the future.',
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
      departureAt: resolvedDepartureAt,
      seats: Number(seats),
      cost: Number(cost),
      femalePassengersOnly: femalePassengersOnly === true,
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

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Passengers view available rides (with optional route filters)
const getApprovedRides = async (req, res) => {
  try {
    const pickupQuery = (req.query.pickup ?? req.query.origin ?? '')
      .toString()
      .trim();
    const destinationQuery = (req.query.destination ?? '').toString().trim();

    const filter = { status: 'approved' };

    if (pickupQuery) {
      filter.pickup = { $regex: escapeRegex(pickupQuery), $options: 'i' };
    }

    if (destinationQuery) {
      filter.destination = {
        $regex: escapeRegex(destinationQuery),
        $options: 'i',
      };
    }

    const rides = await Ride.find(filter)
      .populate('driverId', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({ rides });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Passenger views ride and driver details
const getRideDetails = async (req, res) => {
  try {
    const ride = await Ride.findOne({
      _id: req.params.id,
      status: 'approved',
    }).populate(
      'driverId',
      'name matricNumber gender profilePicture'
    );

    if (!ride) {
      return res.status(404).json({
        message: 'Ride not found or no longer available.',
      });
    }

    const driverApplication = await DriverApplication.findOne({
      userId: ride.driverId._id,
    });

    if (!driverApplication) {
      return res.status(404).json({
        message: 'Driver application not found.',
      });
    }

    res.status(200).json({
      ride,
      driverApplication: {
        vehicleModel: driverApplication.vehicleModel,
        vehicleColor: driverApplication.vehicleColor,
        plateNumber: driverApplication.plateNumber,
      },
    });
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
  getRideDetails,
  getMyRides,
  cancelRide,
};
