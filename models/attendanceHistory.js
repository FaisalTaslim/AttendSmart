const mongoose = require('mongoose');
const {Schema} = mongoose;

const attendanceHistorySchema = mongoose.Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'schoolStudent', 
        required: true
    },
    subjectName: {
        type: String,
        required: true
    },
    date: {type: Date.now(), required: true},
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    }
}, {timestamp: true});

module.exports = mongoose.model('attendanceHistory', attendanceHistorySchema);

const attendanceHistoryEmployeeSchema = new Schema({
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee', 
        required: true
    },
    checkIn: {type: Date, required: true},
    checkOut: {type: Date, required: true},
    status: {
        type: String,
        enum: ['Present', 'Absent'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('attendanceHistoryEmployee', attendanceHistoryEmployeeSchema);
