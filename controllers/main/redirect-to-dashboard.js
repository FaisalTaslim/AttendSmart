exports.redirect = (req, res) => {

    const redirect = {
        'admin': '/dashboard/admin',
        'school-student': '/dashboard/school-student',
        'college-student': '/dashboard/college-student',
        'corporate': '/dashboard/employee/corporate',
        'teacher': '/dashboard/employee/teacher'
    }

    let targetRoute;

    if (req.session.user.role !== 'employee') {
        targetRoute = redirect[req.session.user.role];
    }
    else {
        targetRoute =
            redirect[req.session.user.employeeType];
    }

    if (!targetRoute) {
        return res.render('index', {
            popupMessage: 'Invalid role detected',
            popupType: 'error'
        });
    }

    return res.redirect(targetRoute);
}