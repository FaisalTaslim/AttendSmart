const mongoose = require('mongoose');
const {Schema} = mongoose;

const userLeaveSchema = mongoose.Schema({
    org: {
        type: String, 
        required: true,
    },
    uniqueId: {
        type: String,
        required: true
    },
    userType: {type: String, required: true},
    startDate: {
        type: String,
        required: true,
    },
    endDate: {type: String, required: true},
    leaveType: {type: String, required: true},
    reason: {type: String, required: true},
    status: {
        type: String,
        required: true,
        enum: ['pending', 'accepted', 'rejected']
    }

}, { timestamps: true });

module.exports = mongoose.model('userLeave', userLeaveSchema);