const express = require('express');
const multer = require('multer');
const path = require('path');

const DriverApplication = require('../models/DriverApplication');
const User = require('../models/User');

const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Store uploaded documents
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${req.user._id}-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  }
});

// Only allow image files
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Only JPG and PNG images are allowed'));
    }

    cb(null, true);
  }
});

const uploadDocuments = upload.fields([
  { name: 'drivingLicense', maxCount: 1 },
  { name: 'utmCarSticker', maxCount: 1 }
]);

// SCRUM-14: Submit driver application
router.post(
  '/',
  protect,
  (req, res, next) => {
    uploadDocuments(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      const license = req.files?.drivingLicense?.[0];
      const sticker = req.files?.utmCarSticker?.[0];

      if (!license || !sticker) {
        return res.status(400).json({
          message: 'Both documents are required'
        });
      }

      if (req.user.isDriver) {
        return res.status(400).json({
          message: 'You are already a verified driver'
        });
      }

      const existing = await DriverApplication.findOne({
        user: req.user._id
      });

      if (existing && existing.status !== 'REJECTED') {
        return res.status(409).json({
          message: 'You already have an active application'
        });
      }

      const application = await DriverApplication.findOneAndUpdate(
        { user: req.user._id },
        {
          drivingLicense: license.path,
          utmCarSticker: sticker.path,
          status: 'PENDING',
          reviewedAt: null
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );

      res.status(201).json({
        message: 'Application submitted successfully',
        status: application.status
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Could not submit application'
      });
    }
  }
);

// SCRUM-15: Admin views pending applications
router.get(
  '/pending',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const applications = await DriverApplication.find({
        status: 'PENDING'
      }).populate('user', 'name email');

      res.json(applications);

    } catch (error) {
      res.status(500).json({
        message: 'Could not retrieve applications'
      });
    }
  }
);

// SCRUM-16: Admin approves/rejects application
router.patch(
  '/:id/review',
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({
          message: 'Invalid application status'
        });
      }

      const application = await DriverApplication.findById(
        req.params.id
      );

      if (!application) {
        return res.status(404).json({
          message: 'Application not found'
        });
      }

      if (application.status !== 'PENDING') {
        return res.status(400).json({
          message: 'Application has already been reviewed'
        });
      }

      application.status = status;
      application.reviewedAt = new Date();

      await application.save();

      await User.findByIdAndUpdate(application.user, {
        isDriver: status === 'APPROVED'
      });

      res.json({
        message: `Application ${status.toLowerCase()}`,
        status: application.status
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Could not review application'
      });
    }
  }
);

module.exports = router;