const mongoose = require('mongoose');
const { Schema } = mongoose;

const collegeStudentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    roll: {
        type: String,
        required: true,
        unique: true
    },
    dept: {type: String, required: true},
    contact: {type: String, required: true},
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    org: {
        type: Schema.Types.ObjectId,
        ref: 'Org',
        required: true
    },
    orgBranch: {type: String, required: true},
    classroom: {
        type: Schema.Types.ObjectId,
        ref: 'classroomSchema', 
        required: true
    },
    attendance: [{
        subjectName: {type: String, required: true},
        status: {type: String, enum: ['present', 'absent', 'late'], required: true},
        date: {type: Date, required: true},
        time: {type: String, required: true}
    }],
    attendanceSummary: [{
        subjectName: {type: String, required: true},
        totalLectures: {type: Number, default: 0},
        attendedLectures: {type: Number, default: 0},
        percentage: {type: Number, default: 0}
    }]
}, { timestamps: true });

module.exports = mongoose.model('CollegeStudent', collegeStudentSchema);
