exports.get = async (req, res) => {
    let role = req.session.user.role;

    if(role == 'admin') res.redirect('/dashboard/admin');
    if(role == 'employee') {
        if (req.session.user.employeeType === 'teacher') {
            return res.redirect('/dashboard/employee/teacher');
        }
        return res.redirect('/dashboard/employee/corporate');
    }
    if(role == 'school-student') res.redirect('/dashboard/school-student');
    if(role == 'college-student') res.redirect('/dashboard/college-student'); 
}
