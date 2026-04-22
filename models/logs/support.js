const mongoose = require('mongoose');
const { Schema } = mongoose;

const supportLog = new Schema({
    org: {
        type: String,
        required: true,
    },
    user: {type: String, required: true},
    name: {type: String, required: true},
    email: {type: String, required: true},
    supportType: {
        type: String,
        required: true
    },
    thoughts: { type: String, required: true },

}, { timestamps: true });

const support = mongoose.model('SupportLog', supportLog, 'SupportLog');
module.exports = support;