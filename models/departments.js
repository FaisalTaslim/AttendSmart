const mongoose = require('mongoose');
const { Schema } = mongoose;

const departmentSchema = new Schema({
    org: { type: String, required: true },
    schoolStandards: {
        type: [String],
        default: [],
        set: arr => [...new Set(arr.map(s => s.trim().toLowerCase()))]
    },
    collegeDepartments: {
        type: [String],
        default: [],
        set: arr => [...new Set(arr.map(s => s.trim().toLowerCase()))]
    },
    employeeDepartments: {
        type: [String],
        default: [],
        set: arr => [...new Set(arr.map(s => s.trim().toLowerCase()))]
    }
}, {timestamps: true });

const Department = mongoose.model('Department', departmentSchema, 'Department');
module.exports = Department;