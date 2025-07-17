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
        validate: {
            validator: function lower(value) {
                return value.toLowerCase();
            }
        },
        trim: true
    },
    password: {type: String, required: true, trim: true},
    org: { type: Schema.Types.ObjectId, ref: 'org' },
    
    attendanceSummary: {
        type: [
            {
                subjectName: {type: String, default: ""},
                totalLectures: {type: Number, default: 0},
                attendedLectures: {type: Number, default: 0},
                percentage: {type: Number, default: 0}
            }
        ],
        default: []
    },
    attendanceHistory: {
        type: [
            {
                subjectName: {type: String, required: true},
                date: {type: Date, required: true},
                status: {type: String, enum: ['Present', 'Absent'], required: true}
            }
        ],
        default: []
    }
    
}, { timestamps: true });

module.exports = mongoose.model('CollegeStudent', collegeStudentSchema);
