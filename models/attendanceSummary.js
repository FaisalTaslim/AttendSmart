const mongoose = require('mongoose');
const { Schema } = mongoose;

const summaryStudents = new Schema({
    org: {type: String, required: true},
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
    percentage: {type: Number, default: 0},
    monthlySummary: [
        {
            month: {type: String, default: "", required: true},
            subjectName: {
                type: String,
                default: "",
            },
            totalLectures: {
                type: Number,
                default: 0
            },
            attendedLectures: {type: Number, default: 0},
            percentage: {type: Number, default: 0},
        }
    ]

}, { timestamps: true });

const summaryEmployees = new Schema({
    org: {type: String, required: true},
    employee: {
        type: String,
        required: true
    },
    totalDays: {type: Number, default: 0},
    attendedDays: {type: Number, default: 0},
    percentage: {type: Number, default: 0},
    monthlySummary: [
        {
            month: {type: String, required: true},
            totalDays: {
                type: Number,
                required: true,
            },
            attendedDays: {type: Number, required: true},
            percentage: {
                type: Number,
                required: true
            }
        },
    ]

}, { timestamps: true });

module.exports = {
    StudentSummary: mongoose.model('summary_student', summaryStudents),
    EmployeeSummary: mongoose.model('summary_employee', summaryEmployees)
};