const mongoose = require('mongoose');
const { Schema } = mongoose;

const loginLog = new Schema({
    org: {
        type: String,
        required: true
    },
    user: {type: String, required: true},
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
    createdAt: {type: Date, default: Date.now},

}, { timestamps: true });

const login = mongoose.model('LoginLog', loginLog, 'LoginLog');
module.exports = login;