const mongoose = require('mongoose');
const { Schema } = mongoose;

const summaryStudents = new Schema({
    org: { type: String, required: true },
    student: { type: String, required: true },
    std_dept: {type: String, required: true},
    subjectName: { type: String, default: "" },
    totalLectures: { type: Number, default: 0 },
    attendedLectures: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    monthlySummary: {
        type: Map,
        of: new Schema({
            totalLectures: { type: Number, default: 0 },
            attendedLectures: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 }
        }, { _id: false })
    }

}, { timestamps: true });

const summaryEmployees = new Schema({
    org: { type: String, required: true },
    employee: { type: String, required: true },
    emp_dept: {type: String, required: true},
    totalDays: { type: Number, default: 0 },
    attendedDays: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

    monthlySummary: {
        type: Map,
        of: new Schema({
            totalDays: { type: Number, default: 0 },
            attendedDays: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 }
        }, { _id: false })
    }

}, { timestamps: true });

module.exports = {
    StudentSummary: mongoose.model('summarystudent', summaryStudents),
    EmployeeSummary: mongoose.model('summaryemployee', summaryEmployees)
};