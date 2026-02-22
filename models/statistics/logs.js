const mongoose = require('mongoose');
const { Schema } = mongoose;

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
            createdAt: { type: Date, default: Date.now },
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
            createdAt: { type: Date, default: Date.now },
            _id: false,
        }
    ],
    studentSessionLog: [
        {
            code: {type: String, required: true},
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
            subjectName: {type: String,required: true,},
            expired: {type: Boolean, required: true},
            createdAt: { type: Date, default: Date.now },
            _id: false,
        }
    ],
    studentAttendanceHistory: [
        {
            code: {type: String, required: true},
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
            code: {type: String, required: true},
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
    ],
    leave: [
        {
            code: {type: String, required: true},
            name: {type: String, required: true},
            startDate: {type: Date, required: true},
            endDate: {type: Date, required: true},
            reason: {type: String, required: true},
            _id: false,
        }
    ]

}, { timestamps: true });

const OrgLog = mongoose.model('log', logSchema, 'logs');
module.exports = OrgLog;