const mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");

const noticeSchema = new Schema(
    {
        uniqueId: { type: String, required: true, },
        dateTime: {
            type: String,
            default: () => moment().format("DD-MM-YYYY HH:mm:ss"),
            required: true,
        },
        userIdType: {
            type: String,
            enum: ["employeeId", "rollNo", "uniqueUserId", ""],
            default: "",
        },
        userIdValue: { type: String, default: "", },
        noticeText: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const Notice = mongoose.model("Notice", noticeSchema);

module.exports = Notice;
