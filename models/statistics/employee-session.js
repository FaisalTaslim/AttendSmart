const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSessionSchema = new Schema({
    sessionCode: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true
    },
    instigator: {type: String, required: true},
    shiftType: {type: String, required: true},
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    createdAt: {type: Date, default: Date.now},
    expiresAt: {
        type: Date,
        required: true
    }
});

const employeeSession = mongoose.model('employeeSessions', employeeSessionSchema, "employeeSessions");
module.exports = employeeSession;