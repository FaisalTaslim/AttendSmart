const mongoose = require("mongoose");
const { Schema } = mongoose;

const registerLogSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["failed", "success"],
      required: true,
    },
    org: {type: String, required: true,},
    name: {
      type: String,
      required: true,
    },
    id: {type: String, required: true,},
    code: {type: String, required: true},

    role: {
      type: String,
      enum: ["admin", "teacher", "student", "employee"],
      required: true,
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    email: {type: String, required: true,},
    contact: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RegisterLog",
  registerLogSchema,
  "RegisterLog"
);