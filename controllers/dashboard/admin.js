const Org = require('../../models/users/organization');

exports.dashboard = async (req, res) => {
    const getOrg = await Org.findOne({code: req.session.user.code});
    const setup = getOrg.setup_done;

    res.render('dashboard/admin', {setup});
};