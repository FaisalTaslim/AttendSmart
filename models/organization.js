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
           password: {type: String, required: true}
        }
    ],
    departments: {
        school: {
            type: [String], 
            default: []
        },
        college: {type: [String], default: []},
        employees: {
            type: [String], 
            default: []
        }
    },
    address: {type: String, trim: true, required: true},
    website: {type: String},
    exp_employee: {type: Number, required: true},
    exp_students: {
        type: Number, 
        default: 0
    },
    reg_employee: {
        type: Number,
        default: 0
    },
    reg_students: {type: Number,default: 0},
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
        token: {
            type: String
        },
        expiresAt: {
            type: Date
        }
    }
}, { timestamps: true });

const Org = mongoose.model('Org', orgSchema, 'org');
module.exports = Org;