const mongoose = require('mongoose');
const { Schema } = mongoose;

const schedule = new Schema({
    org: {type: String, required: true},
    shift: {
        type: String,
        enum: ['day', 'night'],
        required: true,
    },
    check_in: 
})