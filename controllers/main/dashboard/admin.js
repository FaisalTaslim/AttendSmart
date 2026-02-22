const Org = require('../../../models/users/organization');
const CollegeStudent = require('../../../models/users/college-student');
const SchoolStudent = require('../../../models/users/school-student');
const Employee = require('../../../models/users/employee');

exports.dashboard = async (req, res) => {
    const getOrg = await Org.findOne({ code: req.session.user.code });

    const subjectsUpload = getOrg.setup.subjectsUploaded;
    const scheduleUpload = getOrg.setup.scheduleUploaded;
    const setup_done = getOrg.setup.done;
    const type = getOrg.type;
    const popupMessage = req.session.popupMessage;
    const popupType = req.session.popupType;

    req.session.popupMessage = null;
    req.session.popupType = null;

    let student_users = [];
    let employee_users = [];

    const map_models = {
        college: CollegeStudent,
        school: SchoolStudent,
    };

    if (map_models[type]) {
        student_users = await map_models[type].find({ org: getOrg.code });
    }

    employee_users = await Employee.find({ org: getOrg.code });

    res.render('dashboard/admin', {
        subjectsUpload,
        scheduleUpload,
        setup_done,
        type,
        student_users,
        employee_users,
        popupMessage,
        popupType,
    });
};