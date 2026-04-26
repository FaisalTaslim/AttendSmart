const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginLog = new Schema({
    type: {
        type: String,
        enum: ['failed', 'success'],
        required: true,
    },
    org: {
        type: String,
        required: true
    },
    id: {
        type: String, 
        required: true
    },
    name: {type: String, required: true},
    role: {
        type: String,
        enum: ['admin', 'employee', 'student', 'employee'],
        required: true
    },
    message: {type: String, required: true},


}, { timestamps: true });

const login = mongoose.model('LoginLog', loginLog, 'LoginLog');
module.exports = login;