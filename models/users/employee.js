const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
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
    employeeId: { type: String, required: true},
    workPlace: {
        type: String,
        enum: ['school', 'college', 'corporate'],
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
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean, default: false},
    theme: {
        type: String,
        enum: ['dark', 'light'],
        default: 'light',
    },
    password: {type: String, required: true},
    termsCheck: {type: String, required: true, default: "not-accepted"},
    setup: {
        faceUploaded: {type: Boolean, default: false},
    }
    
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema, 'employee');