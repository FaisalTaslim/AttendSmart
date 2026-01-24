exports.get = async (req, res) => {
    let role = req.session.user.role;

    if(role == 'admin') res.redirect('/dashboard/admin');
    if(role == 'employee') res.redirect('/dashboard/employee');
    if(role == 'school student') res.redirect('/dashboard/school-student');
    if(role == 'college student') res.redirect('/dashboard/college-student'); 
}