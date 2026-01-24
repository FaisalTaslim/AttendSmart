const CollegeStudent = require('../../models/users/college-student');

exports.dashboard = async (req, res) => {
    const getStudent = await COllegeStudent.findOne({code: req.session.user.code});
    const setup = getStudent.setup_done;

    res.render('dashboard/college-student', {setup});
};