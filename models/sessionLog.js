const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
    studentCode: {
        type: String,
        required: true
    },
    sessionInstigator: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    subjectName: {
        type: String,
        required: true
    },
    orgUniqueId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('SessionLog', sessionLogSchema);