const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeAttendanceHistory = new Schema(
  {
    org: {
      type: String,
      required: true,
    },
    sessionCode: {
      type: String,
      required: true,
    },
    instigator: {
      type: String,
      required: true,
    },
    shift: {
      type: String,
      required: true,
    },

    history: [
      {
        code: String,
        name: String,
        status: {
          type: String,
          enum: ['late', 'on-time'],
        },
        checkIn: Date,
        checkOut: Date,
        _id: false,
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeAttendanceHistory", employeeAttendanceHistory, "employeeAttendanceHistory");