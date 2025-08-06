const mongoose = require('mongoose');
const {Schema} = mongoose;

const departmentSchema = new Schema({
    org: {
        type: String,
        required: true
    },
    schoolStudentStandard: {
        type: [String],
        default: []
    },
    collegeDepartments: {
        type: [String],
        default: []
    },
    employeeDepartments: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Department = mongoose.model('department', departmentSchema);
module.exports = Department;
