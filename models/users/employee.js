const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
    org: {type: String, required: true},
    uniqueId: {
        type: String, 
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: { type: String, required: true},
    dept: {type: String, default: ""},
    workType: {
        type: String,
        enum: ['school_college', 'corporate'],
        required: true
    },
    shift: {
        type: String,
        enum: ['day', 'night'],
        required: true,
    },
    designation: { type: String, required: true },
    contact: { type: String, required: true },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function lower(value) {
                return value.toLowerCase();
            }
        },
        trim: true
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
    org_verified: {
        type: Boolean,
        required: true,
        default: false,
    },
    onLeave: {
        type: Boolean, 
        required: true,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isSuspended: {type: Boolean, default: false},
    password: {type: String, required: true},
    termsCheck: {type: String, required: true, default: "not-accepted"}

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema, 'Employees');