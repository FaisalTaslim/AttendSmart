const mongoose = require("mongoose");
const { Schema } = mongoose;

const employeeSummarySchema = new Schema({
    org: { type: String, required: true },
    code: { 
        type: String, 
        required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    department: { type: String, required: true },
    shift: { type: String, default: null },
    month: {
        type: Number,
        required: true,
    },
    markedSessions: [
        {
            sessionCode: { type: String },
            date: {type: String},
            checkIn: Date,
            checkout: Date,
            isMarked: Boolean,
        }
    ],
    total: { type: Number, default: 0 },
    attended: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },

}, { timestamps: true });

module.exports =
    mongoose.models.EmployeeSummary ||
    mongoose.model("EmployeeSummary", employeeSummarySchema, "employeeSummary");
