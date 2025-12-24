const mongoose = require('mongoose');
const { Schema } = mongoose;

const schoolStudentSchema = new Schema({
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
    roll: {
        type: String,
        required: true
    },
    standard: {type: String, required: true},
    contact: {type: String, required: true},
    email: {
        type: String,
        required: true,
        lowercase: true,
    },
    subjects: {
        type: [String],
        required: true
    },
    faceData: {
        descriptors: {
            type: [[Number]],
            default: []
        },
        registeredAt: {
            type: Date
        }
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isSuspended: {type: Boolean, default: false},
    onLeave: {
        type: Boolean,
        required: true,
        default: false
    },
    password: {type: String, required: true, trim: true},
    termsCheck: {type: String, required: true}

}, { timestamps: true });

module.exports = mongoose.model('schoolStudent', schoolStudentSchema, 'schoolStudent');