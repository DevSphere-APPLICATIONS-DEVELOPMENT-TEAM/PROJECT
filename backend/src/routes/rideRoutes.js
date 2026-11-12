
const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  publishRide,
  getApprovedRides,
  getMyRides,
  cancelRide,
} = require('../controllers/rideController');

// Publish a ride
router.post('/', authMiddleware, publishRide);

// Passengers view available rides
router.get('/approved', authMiddleware, getApprovedRides);

// Driver views their own rides
router.get('/my-rides', authMiddleware, getMyRides);

router.put('/:id/cancel', authMiddleware, cancelRide);

module.exports = router;
