exports.get = async (req, res) => {
    let role = req.session.user.role;

    if(role == 'admin') res.redirect('/dashboard/admin');
}