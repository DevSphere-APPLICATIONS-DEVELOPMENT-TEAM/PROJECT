const DriverApplication = require("../models/DriverApplication");
const User = require("../models/User");

// Check whether the current user is an admin
const checkAdmin = (req, res) => {
  if (req.user.role !== "admin") {
    res.status(403).json({
      message: "Access denied. Admin only.",
    });
    return false;
  }

  return true;
};

// Submit driver application
const submitApplication = async (req, res) => {
  try {
    const {
      vehicleModel,
      vehicleColor,
      plateNumber,
      licenseNumber,

      licencePhoto,
        stickerPhoto,
    } = req.body;

    if (!vehicleModel || !vehicleColor || !plateNumber || !licenseNumber) {
      return res.status(400).json({
        message: "Please complete all driver information.",
      });
    }

    const existingApplication = await DriverApplication.findOne({
      userId: req.user.id,
    });

    if (existingApplication) {
      if (existingApplication.status !== "rejected") {
        return res.status(400).json({
          message: "You already have a driver application.",
        });
      }

      existingApplication.vehicleModel = vehicleModel;
      existingApplication.vehicleColor = vehicleColor;
      existingApplication.plateNumber = plateNumber;
      existingApplication.licenseNumber = licenseNumber;
      existingApplication.licencePhoto = licencePhoto;
      existingApplication.stickerPhoto = stickerPhoto; 
      existingApplication.status = "pending";
      existingApplication.adminRemarks = "";

      await existingApplication.save();

      return res.status(200).json({
        message: "Driver application resubmitted successfully.",
        application: existingApplication,
      });
    }

    const application = await DriverApplication.create({
      userId: req.user.id,
      vehicleModel,
      vehicleColor,
      plateNumber,
      licenseNumber,
      licencePhoto,
      stickerPhoto,

    });

    return res.status(201).json({
      message: "Driver application submitted successfully.",
      application,
    });
  } catch (error) { 
    console
    console.error("Driver application error:", error);

    return res.status(500).json({
      message: "Unable to submit driver application.",
    });
  }
};

// Get current student's application
const getMyApplication = async (req, res) => {
  try {
    const application = await DriverApplication.findOne({
      userId: req.user.id,
    });

    return res.status(200).json({ application });
  } catch (error) {
    console.error("Get application error:", error);

    return res.status(500).json({
      message: "Unable to retrieve driver application.",
    });
  }
};

// Get all pending applications (admin only)
const getPendingApplications = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const applications = await DriverApplication.find({
      status: "pending",
    }).populate("userId", "name email matricNumber phone");

    return res.status(200).json({ applications });
  } catch (error) {
    console.error("Get pending applications error:", error);

    return res.status(500).json({
      message: "Unable to retrieve pending applications.",
    });
  }
};

// Approve driver application (admin only)
const approveApplication = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const application = await DriverApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Driver application not found.",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "This application is no longer pending.",
      });
    }

    const user = await User.findById(application.userId);

    if (!user) {
      return res.status(404).json({
        message: "Student account not found.",
      });
    }

    application.status = "approved";
    application.adminRemarks = "";
    user.isDriver = true;

    await application.save();
    await user.save();

    return res.status(200).json({
      message: "Driver application approved successfully.",
      application,
    });
  } catch (error) {
    console.error("Approve application error:", error);

    return res.status(500).json({
      message: "Unable to approve driver application.",
    });
  }
};

// Reject driver application (admin only)
const rejectApplication = async (req, res) => {
  try {
    if (!checkAdmin(req, res)) return;

    const { adminRemarks } = req.body;

    const application = await DriverApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Driver application not found.",
      });
    }

    if (application.status !== "pending") {
      return res.status(400).json({
        message: "This application is no longer pending.",
      });
    }

    const user = await User.findById(application.userId);

    if (!user) {
      return res.status(404).json({
        message: "Student account not found.",
      });
    }

    application.status = "rejected";
    application.adminRemarks = adminRemarks || "";
    user.isDriver = false;

    await application.save();
    await user.save();

    return res.status(200).json({
      message: "Driver application rejected.",
      application,
    });
  } catch (error) {
    console.error("Unable to reject driver application:", error);

    return res.status(500).json({
      message: "Unable to reject driver application.",
    });
  }
};

module.exports = {
  submitApplication,
  getMyApplication,
  getPendingApplications,
  approveApplication,
  rejectApplication,
};