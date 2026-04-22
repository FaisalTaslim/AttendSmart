const mongoose = require('mongoose');
const {Schema} = mongoose;

const registerLog = new Schema({
    org: {
        type: String,
        required: true
    },
    name: {type: String, required: true},
    id: {type: String, required: true},
    role: {
        type: String,
        enum: ['admin', 'teacher', 'student', 'employee'],
        required: true,
    },
    email: {type: String, required: true},
    contact: {type: String, required: true},
    

}, {timestamps: true});

const register = mongoose.model('RegisterLog', registerLog, 'RegisterLog');
module.exports = register;