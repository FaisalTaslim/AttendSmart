const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSummarySchema = mongoose.Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'schoolStudent',  
        required: true
    },
    subjectName: {
        type: String, 
        default: ""
    },
    totalLectures: {type: Number, default: 0},
    attendedLectures: {type: Number, default: 0},
    percentage: {
        type: Number, 
        default: 0
    }

}, { timestamps: true });

module.exports = mongoose.model('attendanceSummary', attendanceSummarySchema);