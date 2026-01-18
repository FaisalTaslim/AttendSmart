const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment')

const logSchema = new Schema({
    org: {
        type: String,
        required: true
    },
    register: [
        {
            name: {type: String, required: true},
            role: {
                type: String,
                enum: ['admin', 'teacher', 'student', 'employee'],
            },
            id: {type: String, required: true},
            email: {type: String, required: true},
            _id: false,
        }
    ],
    loginLogs: [
        {
            userId: {type: String, required: true},
            name: {type: String, required: true},
            role: {
                type: String, 
                required: true
            },
            ip: { 
                type: String, 
                required: true 
            },
            createdAt: {
                type: String, 
                default: () => moment().format("DD-MM-YYYY HH:mm:ss"),
                required: true
            },
            _id: false,
        }
    ],
    supportLogs: [
        {
            userId: {type: String, required: true},
            name: {type: String, required: true},
            role: {type: String, required: true},
            email: {type: String, required: true},
            supportType: {
                type: String,
                required: true
            },
            thoughts: {type: String, required: true},
            createdAt: {
                type: String,
                default: () => moment().format("DD-MM-YYYY HH:mm:ss"),
                required: true
            },
            _id: false,
        }
    ],
    employeeSessionLogs: [
        {
            employeeCode: {
                type: String,
                required: true
            },
            sessionInstigator: {type: String, required: true},
            shiftType: {type: String, required: true},
            attendanceType: {type: String, required: true},
            createdAt: {
                type: String,
                required: true,
                default: () => moment().format("DD-MM-YYYY HH:mm:ss"),
            },
            _id: false,
        }
    ],
    studentSessionLog: [
        {
            studentCode: {
                type: String,
                required: true
            },
            class: {
                type: [String],
                required: true,
                default: []
            },
            sessionInstigator: {type: String, required: true},
            sessionType: {
                type: String, 
                enum: ['fresh-session', 'retake-session'],
                required: true,
            },
            subjectName: {
                type: String,
                required: true,
            },
            expired: {type: Boolean, required: true},
            createdAt: {
                type: String,
                required: true,
            },
            _id: false,
        }
    ],

    studentAttendanceHistory: [
        {
            studentId: {type: String, required: true},
            name: {type: String, required: true},
            dept: {
                type: String,
                required: true
            },
            subjectName: {
                type: String,
                required: true
            },
            date: {type: String, required: true},
            status: {
                type: String,
                enum: ['Present', 'Absent'],
                required: true
            },
            reason: {type: String, default: ""},
            _id: false,
        }
    ],

    employeeAttendanceHistory: [
        {
            employeeId: {type: String, required: true},
            name: {type: String, required: true},
            dept: {
                type: String,
                required: true,
                default: "Unknown Dept"
            },
            checkIn: {
                type: String,
                required: true
            },
            checkOut: {type: String},
            status: {
                type: String,
                enum: ['Present', 'Absent'],
                required: true
            },
            _id: false,
        }
    ]

}, { timestamps: true });

const OrgLog = mongoose.model('log', logSchema, 'Logs');
module.exports = OrgLog;