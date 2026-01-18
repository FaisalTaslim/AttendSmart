const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const summary = new Schema({
    org: {type: String, required: true},    
    code: {type: String, required: true},
    name: {type: String, required: true},
    department: {type: String, required: true},

    subject: {type: String, default: null},

    month: {
        type: String,
        default: () => moment().format("YYYY-MM")
    },
    total: {type: Number, default: 0},
    attended: {type: Number, default: 0},
    leave: {type: Number, default: 0},
    percentage: {type: Number, default: 0}

}, { timestamps: true });

module.exports = mongoose.model("summary", summary, "summary");