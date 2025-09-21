const mongoose = require('mongoose');
const { Schema } = mongoose;

const departmentSchema = new Schema({
    org: { type: String, required: true },
    schoolStandards: {
        type: [String],
        default: [],
        set: arr => [...new Set(arr.map(s => s.trim().toUpperCase()))]
    },
    collegeDepartments: {
        type: [String],
        default: [],
        set: arr => [...new Set(arr.map(s => s.trim().toUpperCase()))]
    },
    employeeDepartments: {
        type: [String],
        default: [],
        set: arr => [...new Set(arr.map(s => s.trim().toUpperCase()))]
    }
}, {timestamps: true });

const Department = mongoose.model('Department', departmentSchema, 'Department');
module.exports = Department;