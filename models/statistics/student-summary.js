const mongoose = require('mongoose');
const { Schema } = mongoose;

const summary = new Schema({
    org: {type: String, required: true},    
    code: {type: String, required: true},
    name: {type: String, required: true},
    department: {type: String, required: true},

    subject: {type: String, default: null},

    month: {
        type: Number,
    },
    total: {type: Number, default: 0},
    attended: {type: Number, default: 0},
    percentage: {type: Number, default: 0}

}, { timestamps: true });

module.exports = mongoose.model("studentSummary", summary, "studentSummary");