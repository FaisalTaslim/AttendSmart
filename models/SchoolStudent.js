const mongoose = require('mongoose');
const { Schema } = mongoose;

const schoolStudentSchema = new Schema({
    org: {type: Schema.Types.ObjectId, ref: 'org'},
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
    roll: {
        type: String,
        required: true
    },
    division: {type: String, required: true},
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
    password: { type: String, required: true, trim: true },
    attendanceSummary: [{ type: Schema.Types.ObjectId, ref: 'attendanceSummary' }],
    attendanceHistory: [{ type: Schema.Types.ObjectId, ref: 'attendanceHistory' }],
    termsCheck: {type: String, required: true}

}, { timestamps: true });

module.exports = mongoose.model('schoolStudent', schoolStudentSchema);