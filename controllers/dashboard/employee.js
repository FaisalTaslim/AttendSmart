const Employee = require('../../models/users/employee');

exports.dashboard = async (req, res) => {
    const getEmployee = await Employee.findOne({code: req.session.user.code});
    const setup = getEmployee.setup_done;

    res.render('dashboard/employee', {setup});
};