const mongoose = require("mongoose");
const { Schema } = mongoose;

const studentAttendanceHistory = new Schema({
    org: {
        type: String,
        required: true,
    },
    sessionCode: {
        type: String,
        required: true,
    },
    instigator: {type: String, required: true},
    subject: {type: String},
    department: {type: String, required: true},
    history: [
        {
            code: String,
            sessionKey: String,
            name: String,
            date: Date,
            isMarked: Boolean,
            _id: false,
        }
    ],
}, {timestamps: true})

module.exports = mongoose.model('StudentAttendanceHistory', studentAttendanceHistory, 'studentAttendanceHistory');