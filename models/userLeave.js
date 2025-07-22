const mongoose = require('mongoose');
const {Schema} = mongoose;

const userLeaveSchema = mongoose.Schema({
    org: {type: Schema.Types.ObjectId, required: true, ref:'Org'},
    uniqueId: {
        type: Number,
        required: true
    },
    startDate: {
        type: String,
        required: true,
    },
    endDate: {type: String, required: true},
    leaveType: {type: String, required: true},
    reason: {type: String, required: true}
}, { timestamps: true });

module.exports = mongoose.model('userLeave', userLeaveSchema);