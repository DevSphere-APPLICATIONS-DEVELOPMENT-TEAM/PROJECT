
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

// Save or update application as draft
const saveDraft = async (req, res) => {
  try {
    const {
      vehicleModel,
      vehicleColor,
      plateNumber,
      licenseNumber,
      licencePhoto,
      stickerPhoto,
    } = req.body;

    let application = await DriverApplication.findOne({
      userId: req.user.id,
    });

    if (application && ["pending", "approved"].includes(application.status)) {
      return res.status(400).json({
        message: "You cannot edit an application that is pending or approved.",
      });
    }

    const fields = {
      vehicleModel,
      vehicleColor,
      plateNumber,
      licenseNumber,
      licencePhoto,
      stickerPhoto,
    };

    if (!application) {
      application = new DriverApplication({
        userId: req.user.id,
        status: "draft",
      });
    }

    // Update only fields provided by the frontend
    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined) {
        application[key] = typeof value === "string" ? value.trim() : value;
      }
    });

    application.status = "draft";

    await application.save();

    return res.status(200).json({
      message: "Draft saved successfully.",
      application,
    });
  } catch (error) {
    console.error("Save draft error:", error);

    return res.status(500).json({
      message: "Unable to save application draft.",
    });
  }
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

    // Validate all required information
    if (
      !vehicleModel?.trim() ||
      !vehicleColor?.trim() ||
      !plateNumber?.trim() ||
      !licenseNumber?.trim() ||
      !licencePhoto ||
      !stickerPhoto
    ) {
      return res.status(400).json({
        message: "Please complete all driver information and upload both photos.",
      });
    }

    let application = await DriverApplication.findOne({
      userId: req.user.id,
    });

    if (application && ["pending", "approved"].includes(application.status)) {
      return res.status(400).json({
        message: "You already have an active driver application.",
      });
    }

    const applicationData = {
      vehicleModel: vehicleModel.trim(),
      vehicleColor: vehicleColor.trim(),
      plateNumber: plateNumber.trim().toUpperCase(),
      licenseNumber: licenseNumber.trim(),
      licencePhoto,
      stickerPhoto,
      status: "pending",
      adminRemarks: "",
      submittedAt: new Date(),
    };

    if (application) {
      Object.assign(application, applicationData);
      await application.save();
    } else {
      application = await DriverApplication.create({
        userId: req.user.id,
        ...applicationData,
      });
    }

    return res.status(200).json({
      message: "Driver application submitted successfully.",
      application,
    });
  } catch (error) {
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
      message: "Unable to retrieve driver applications.",
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
    console.error("Reject application error:", error);

    return res.status(500).json({
      message: "Unable to reject driver application.",
    });
  }
};

module.exports = {
  saveDraft,
  submitApplication,
  getMyApplication,
  getPendingApplications,
  approveApplication,
  rejectApplication,
};
