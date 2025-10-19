const mongoose = require('mongoose');
const { Schema } = mongoose;

const overallSummaryStudents = new Schema({
    org: {type: String, required: true },
    student: {
        type: String, 
        required: true
    },
    studentName: {type: String, required: true},
    std_dept: {
        type: String, 
        required: true
    },
    subjectName: {
        type: String, 
        default: "",
        required: true
    },
    totalLectures: {type: Number, default: 0},
    attendedLectures: {type: Number, default: 0},
    leaveDays: {type: Number, default: 0},
    percentage: {type: Number, default: 0},

}, { timestamps: true });

const overallSummaryEmployees = new Schema({
    org: {type: String, required: true},
    employee: {type: String, required: true},
    employeeName: {type: String, required: true},
    emp_dept: {
        type: String, 
        required: true
    },
    shift: {type: String, required: true},
    totalDays: { 
        type: Number, 
        default: 0 
    },
    attendedDays: {type: Number, default: 0},
    leaveDays: {type: Number, default: 0},
    percentage: {type: Number, default: 0},

}, { timestamps: true });

module.exports = {
    FinalStudentSummary: mongoose.model('overallSummaryStudent', overallSummaryStudents, 'overallSummaryStudent'),
    FinalEmployeeSummary: mongoose.model('overallSummaryEmployee', overallSummaryEmployees,'overallSummaryEmployee')
};