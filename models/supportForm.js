const mongoose = require('mongoose');
const {Schema} = mongoose;

const supportSchema = mongoose.Schema({
    orgName: {type: String, required: true, trim: true},
    orgBranch: {
        type: String, 
        required: true,
        trim: true
    },
    userName: {type: String, required: true, trim: true},
    userId: {type: String, required: true, trim: true},
    email: {
        type: String, 
        required: true,
        trim: true,
        validate: {
            validator: function lower(value) {
                return value.toLowerCase();
            }
        }
    },
    supportType: {type: String, required: true},
    thoughts: {
        type: String,
        required: true
    }
}, {timestamps: true})

module.exports = mongoose.model('supportForm', supportSchema);