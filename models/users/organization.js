const mongoose = require('mongoose');
const { Schema } = mongoose;

const orgSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    org: {
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    branch: {
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['school', 'college', 'corporate'], required: true
    },
    admin: [
        {
            name: {type: String, required: true, trim: true},
            role: {type: String, default: "admin"},
            adminId: {type: String, required: true},
            contact: {type: String, required: true},
            email: {
                type: String,
                required: true
            },
           password: {type: String, required: true},
            _id: false
        },
    ],
    subjects: [
        {
            class: {type: String, required: true},
            majors: {
                type: [String],
                required: true
            },
            optionals: {type: [String]},
            minors: {type: [String]},
            _id: false,
        }
    ],
    address: {type: String, trim: true, required: true},
    website: {type: String},
    agreement: {
        type: Boolean,
        default: false
    },
    isDeleted: {type: Boolean, default: false},
    isSuspended: {type: Boolean, default: false},
    verification: {
        status: {
            type: String,
            enum: ["pending", "verified"],
            default: "pending"
        },
        token: {type: String},
        expiresAt: {type: Date}
    }
}, { timestamps: true });

const Org = mongoose.model('Org', orgSchema, 'org');
module.exports = Org;