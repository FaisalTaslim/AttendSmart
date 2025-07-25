const mongoose = require('mongoose');
const { Schema } = mongoose;

const collegeStudentSchema = new Schema({
    org: {type: String, required: true},
    uniqueId: {type: String, required: true, unique: true},
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
    subjects: {
        type: [String],
        required: true
    },
    password: {type: String, required: true, trim: true, unique: true},

    attendanceSummary: [{type: Schema.Types.ObjectId, ref: 'attendanceSummary'}],
    attendanceHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: 'attendanceHistory'
        }
    ],

    termsCheck: { type: String, required: true, default: "not-accepted" }

}, { timestamps: true });

module.exports = mongoose.model('collegeStudent', collegeStudentSchema);
