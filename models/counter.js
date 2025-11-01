const mongoose = require('mongoose');
const {Schema} = mongoose;

const counterSchema = mongoose.Schema({
    originalCountValue: {
        type: Number,
        required: true,
        default: "0"
    },
    newAdminValue: {type: Number, required: true, default: "0"},
    newStudentValue: {type: Number, required: true,
         default: "0"},
    newEmployeeValue: {
        type: Number,
        required: true,
        default: "0"
    }
});

module.exports = mongoose.model('counter', counterSchema);