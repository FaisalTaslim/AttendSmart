const mongoose = require('mongoose');

const employeeSessionLogSchema = new mongoose.Schema({
    org: {type: String, required: true},
    employeeCode: {
        type: String,
        required: true
    },
    sessionInstigator: {type: String, required: true},
    department: {type: String, required: false},
    orgUniqueId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Optional: auto-delete after 10 mins
    }
});

module.exports = mongoose.model('employeeSessionLog', employeeSessionLogSchema);
