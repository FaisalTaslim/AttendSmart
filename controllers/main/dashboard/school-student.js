const SchoolStudent = require('../../../models/users/school-student');

exports.dashboard = async (req, res) => {
    const getStudent = await SchoolStudent.findOne({code: req.session.user.code});
    const setup = getStudent.setup.faceUploaded;
    const subjects = Array.isArray(getStudent?.subjects) ? getStudent.subjects : [];

    res.render('dashboard/school-student', {setup, subjects});
};