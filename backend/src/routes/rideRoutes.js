const express = require('express');
const router = express.Router();
const { publishRide } = require('../controllers/rideController');

router.post('/', publishRide);

module.exports = router;