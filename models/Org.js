const mongoose = require('mongoose');
const { Schema } = mongoose;

const orgSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        required: true,
        unique: true
    },
    orgName: {type: String, required: true},
    orgBranch: {type: String, required: true},
    orgType: {
        type: String,
        enum: ['school', 'college', 'corporate'], required: true
    },
    admin: [
        {
            adminName: {type: String, required: true, trim: true},
            role: {type: String, default: "Admin"},
            adminId: {type: String, required: true},
            adminContact: {type: String, required: true},
            adminEmail: {
                type: String,
                required: true
            },
            adminPassword: {type: String, required: true}
        }
    ],
    address: {type: String, trim: true},
    orgContact: {type: String, trim: true},
    orgEmail: {type: String, trim: true},
    orgWebsite: {type: String},
    expectedEmployees: {type: Number, required: true},
    expectedStudents: {
        type: Number,  
        default: 0
    },
    registeredEmployees: {
        type: Number,
        default: 0
    },
    registeredStudents: {
        type: Number,
        default: 0
    },
    termsCheck: {type: String, default: "not accepted", required: true}

}, { timestamps: true });

const Org = mongoose.model('Org', orgSchema, 'Org');
module.exports = Org;