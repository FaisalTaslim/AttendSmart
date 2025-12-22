const mongoose = require('mongoose');
const { Schema } = mongoose;

const departmentSchema = new Schema({
    org: { type: String, required: true },
    schoolStandards: {
        type: [String],
        default: [],
    },
    collegeDepartments: {
        type: [String],
        default: [],
    },
    employeeDepartments: {
        type: [String],
        default: [],
    }
}, {timestamps: true });

const Department = mongoose.model('Department', departmentSchema, 'Department');
module.exports = Department;