exports.redirect = (req, res) => {
    if(req.session.user.role == 'admin') {
        res.render('dashboards/admin');
    }
    else if(req.session.user.role == 'school-student') {
        res.render('dashboards/school-student');
    }
    else if(req.session.user.role == 'college-student') { 
        res.render('dashboards/college-student');
    }
    else if(req.session.user.role == 'employee' && req.session.user.employeeType == 'corporate') {
        res.render('dashboards/employee');
    }
    else if (req.session.user.role == 'employee' && req.session.user.employeeType == 'teacher') {
        res.render('dashboards/teacher');
    }
    else {
        res.redirect('index', {
            popupMessage: 'Not a valid role',
            popupType: 'error',
        })
    }
}