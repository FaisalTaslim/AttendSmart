const mongoose = require('mongoose');
const { Schema } = mongoose;

const employeeSchema = new Schema({
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
    org: { type: Schema.Types.ObjectId, ref: 'org' },
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
        ref: 'summaryEmployee'
    },
    attendanceHistory: [{ type: Schema.Types.ObjectId, ref: 'attendanceHistory' }],

}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);