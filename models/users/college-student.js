const mongoose = require('mongoose');
const { Schema } = mongoose;

const collegeStudentSchema = new Schema({
    org: {type: String, required: true},
    code: {
        type: String, 
        required: true, 
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    roll: {type: String, required: true},
    dept: {type: String, required: true},
    contact: {type: String, required: true},
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    subjects: {
        type: [String],
        required: true
    },
    faceData: {
        descriptors: {
            type: [[Number]],
            default: []
        }
    },
    verification: {
        status: {
            type: String,
            enum: ["pending", "verified"],
            default: "pending"
        },
        token: {
            type: String
        },
        expiresAt: {
            type: Date
        }
    },
    onLeave: {type: Boolean, required: true, default: false},
    totalLeave: {type: Number, default: 0},
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean, default: false},
    theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'light',
    },
    password: {type: String, required: true},
    termsCheck: {type: String, required: true, default: "not-accepted"}

}, { timestamps: true });

module.exports = mongoose.model('collegeStudent', collegeStudentSchema, 'college_student');