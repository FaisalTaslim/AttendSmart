const mongoose = require('mongoose');
const {Schema} = mongoose;

const attendanceHistoryStudentSchema = mongoose.Schema({
    student: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    date: {type: Date.now, required: true},
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    }
}, {timestamps: true});

const attendanceHistoryEmployeeSchema = new Schema({
    employee: {
        type: String,
        required: true
    },
    dept: {
        type: String,
        required: true
    },
    checkIn: {type: Date, required: true},
    checkOut: {type: Date, required: true},
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    }
}, {timestamps: true});

module.exports = {
    AttendanceHistoryStudent: mongoose.model('attendance_history_student', attendanceHistoryStudentSchema),
    AttendanceHistoryEmployee: mongoose.model('attendance_history_employee', attendanceHistoryEmployeeSchema)
};