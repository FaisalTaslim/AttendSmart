const mongoose = require('mongoose');
const {Schema} = mongoose;

const counterSchema = mongoose.Schema({
    originalCountValue: {
        type: String,
        required: true,
        default: "0"
    },
    newAdminValue: {type: String, required: true, default: "0"},
    newStudentValue: {type: String, required: true,
         default: "0"},
    newEmployeeValue: {
        type: String,
        required: true,
        default: "0"
    }
});

module.exports = mongoose.model('counter', counterSchema);