const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  submitApplication,
  getMyApplication,
  getPendingApplications,
  approveApplication,
  rejectApplication,
} = require("../controllers/driverController");

router.post("/apply", authMiddleware, submitApplication);

router.get("/my-application", authMiddleware, getMyApplication);

// Admin routes
router.get("/applications/pending", authMiddleware, getPendingApplications);
router.put("/:id/approve", authMiddleware, approveApplication);
router.put("/:id/reject", authMiddleware, rejectApplication);

module.exports = router;