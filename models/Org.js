const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/AttendSmart')
const { Schema } = mongoose;

const orgSchema = new mongoose.Schema({
    orgName: {type: String, required: true},
    orgBranch: {type: String, default: null},
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

}, { timestamps: true });

const Org = mongoose.model('Org', orgSchema);
module.exports = Org;