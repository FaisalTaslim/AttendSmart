const mongoose = require('mongoose');
const { Schema } = mongoose;

const userOnLeaveLog = new Schema({
    uniqueId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true,
    },
    userType: {type: String, required: true},
    startDate: {
        type: Date,          
        required: true,
    },
    endDate: {type: Date,required: true,},
}, {timestamp: true});

module.exports = mongoose.model('userOnLeaveLog', userOnLeaveLog, 'userOnLeaveLog');