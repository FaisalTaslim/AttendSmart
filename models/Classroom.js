const mongoose = require('mongoose');
const { Schema } = mongoose;

const classroomSchema = new mongoose.Schema({
    classId: {
        type: String,
        default: () => Math.random().toString(36).substring(2, 10)
    },
    roomName: {
        type: String,
        required: true,
        trim: true
    },
    subjects: {
        type: [String],
        default: []
    },
    orgId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Org',
        required: true
    }
});

const Classroom = mongoose.model('Classroom', classroomSchema);
module.exports('Classroom', classroomSchema);