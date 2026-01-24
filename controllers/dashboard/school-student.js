const SchoolStudent = require('../../models/users/school-student');

exports.dashboard = async (req, res) => {
    const getStudent = await SchoolStudent.findOne({code: req.session.user.code});
    const setup = getStudent.setup_done;

    res.render('dashboard/school-student', {setup});
};