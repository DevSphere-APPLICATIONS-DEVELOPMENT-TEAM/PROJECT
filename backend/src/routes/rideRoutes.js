
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  publishRide,
  getApprovedRides,
  getRideDetails,
  getMyRides,
  cancelRide,
} = require('../controllers/rideController');

// Publish a ride
router.post('/', authMiddleware, publishRide);

// Passengers view available rides
router.get('/approved', authMiddleware, getApprovedRides);

// Driver views their own rides
router.get('/my-rides', authMiddleware, getMyRides);

// Passenger views ride details
router.get('/:id', authMiddleware, getRideDetails);

router.put('/:id/cancel', authMiddleware, cancelRide);

module.exports = router;
