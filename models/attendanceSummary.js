const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSummarySchema = new Schema({
    student: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        default: ""
    },
    totalLectures: {type: Number, default: 0},
    attendedLectures: {type: Number, default: 0},
    percentage: {type: Number, default: 0}
}, { timestamps: true });

const attendanceSummaryEmployee = new Schema({
    employee: {
        type: String,
        required: true
    },
    totalDays: {type: Number, default: 0},
    attendedDays: {type: Number, default: 0},
    percentage: {type: Number, default: 0}
}, { timestamps: true });

module.exports = {
    StudentSummary: mongoose.model('attendanceSummary', attendanceSummarySchema),
    EmployeeSummary: mongoose.model('summaryEmployee', attendanceSummaryEmployee)
};
