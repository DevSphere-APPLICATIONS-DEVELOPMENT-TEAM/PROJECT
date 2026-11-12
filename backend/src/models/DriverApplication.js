
const mongoose = require("mongoose");

const driverApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleModel: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleColor: {
      type: String,
      required: true,
      trim: true,
    },

    plateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    licenseNumber: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    adminRemarks: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DriverApplication",
  driverApplicationSchema
);
