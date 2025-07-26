const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
    org: { type: String, required: true},
    uniqueId: {
        type: String, 
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: true,
        trim: true
    },
    employeeId: { type: String, required: true},
    workType: {
        type: String,
        enum: ['school_college', 'corporate'],
        required: true
    },
    designation: { type: String, required: true },
    contact: { type: String, required: true },
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
    password: { type: String, required: true, trim: true },
    attendanceSummary: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'summaryEmployee',
        default: null
    },
    attendanceHistory: [{ type: Schema.Types.ObjectId, ref: 'attendanceHistory' }],
    termsCheck: {type: String, required: true}

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);