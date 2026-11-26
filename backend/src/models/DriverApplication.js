
const mongoose = require("mongoose");

const driverApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId,ref: "User",required: true,unique: true,},
    vehicleModel: {type: String,required: true,trim: true,},
    vehicleColor: {type: String,required: true,trim: true,},
    plateNumber: {type: String,required: true,trim: true,uppercase: true,},
    licenseNumber: {type: String,required: true, trim: true,},
    licencePhoto : { type: String, default : ""},
    stickerPhoto: { type: String, default : ""},
    status: {type: String, enum: ["draft", "pending", "approved", "rejected"],default: "draft",},
    adminRemarks: {type: String,default: "",},
    submittedAt: {type: Date,default: null,},

  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DriverApplication",
  driverApplicationSchema
);
