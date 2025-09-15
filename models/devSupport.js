const mongoose = require('mongoose');
const { Schema } = mongoose;
const moment = require('moment');

const devSupportSchema = new Schema({
    org: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    supportType: {
        type: String,
        required: true,
        enum: ["feedback", "problem", "question"], 
    },
    thoughts: {
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: () => moment().format("DD-MM-YYYY HH:mm:ss"),
    },
});

module.exports = mongoose.model("DevSupport", devSupportSchema);
