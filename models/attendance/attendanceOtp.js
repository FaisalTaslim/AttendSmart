const mongoose = require("mongoose");
const { Schema } = mongoose;

const attendanceOtpSchema = new Schema({

    org: {
        type: String,
        required: true
    },

    studentCode: {
        type: String,
        required: true,
        index: true
    },

    sessionCode: {
        type: String,
        required: true,
        index: true
    },

    subject: {
        type: String,
        required: true
    },

    otp: {
        type: String,
        required: true
    },

    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },

    isUsed: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

module.exports = mongoose.model("attendanceOtp", attendanceOtpSchema);