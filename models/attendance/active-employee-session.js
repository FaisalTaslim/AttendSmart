const mongoose = require('mongoose');
const { Schema } = mongoose;

const activeSession = new Schema({
    org: {
        type: String,
        required: true
    },
    sessionCode: {
        type: String,
        required: true,
        unique: true,
    },
    instigator: {
        type: String,
        required: true
    },
    shift: {
        type: String,
        required: true,
        enum: ['day', 'night']
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    }

}, { timestamps: true });

module.exports = mongoose.model(
    'activeEmployeeSessions', activeSession, 'activeEmployeeSessions'
);