const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment')

const logSchema = new Schema({
    org: {
        type: String,
        required: true
    },
    registerLogs: {
        type: [String],
        required: true,
        default: []
    },
    loginLogs: [
        {
            userId: {type: String, required: true},
            userName: {type: String, required: true},
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
            } 
        }
    ],
    supportLogs: [
        {
            userId: {type: String, required: true},
            userName: {type: String, required: true},
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
            } 
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
            }
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
            }
        }
    ],

    studentAttendanceHistory: [
        {
            studentId: {type: String, required: true},
            studentName: {type: String, required: true},
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
            reason: {type: String, default: ""}
        }
    ],

    employeeAttendanceHistory: [
        {
            employeeId: {type: String, required: true},
            employeeName: {type: String, required: true},
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
            }
        }
    ]

}, { timestamps: true });

const OrgLog = mongoose.model('log', logSchema, 'Logs');
module.exports = OrgLog;