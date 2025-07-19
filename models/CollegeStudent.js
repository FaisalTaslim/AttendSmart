const mongoose = require('mongoose');
const { Schema } = mongoose;

const collegeStudentSchema = new Schema({
    uniqueId: {type: String, required: true, unique: true},
    org: { type: Schema.Types.ObjectId, ref: 'org' },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    roll: {
        type: String,
        required: true,
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
    
    attendanceSummary: [{ type: Schema.Types.ObjectId, ref: 'attendanceSummary' }],
    attendanceHistory: [{ type: Schema.Types.ObjectId, ref: 'attendanceHistory' }],
    
}, { timestamps: true });

module.exports = mongoose.model('collegeStudent', collegeStudentSchema);
