const CollegeStudent = require('../../../models/users/college-student');

exports.dashboard = async (req, res) => {
    const getStudent = await CollegeStudent.findOne({code: req.session.user.code});
    const setup = getStudent?.setup?.faceUploaded ?? false;
    const subjects = Array.isArray(getStudent?.subjects) ? getStudent.subjects : [];

    res.render('dashboard/college-student', {setup, subjects});
};
