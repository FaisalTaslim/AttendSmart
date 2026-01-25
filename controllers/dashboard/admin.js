const Org = require('../../models/users/organization');

exports.dashboard = async (req, res) => {
    const getOrg = await Org.findOne({code: req.session.user.code});
    const subjectsUpload = getOrg.setup.subjectsUploaded;
    const scheduleUpload = getOrg.setup.scheduleUploaded;
    const setup_done = getOrg.setup.done;
    const type = getOrg.type;

    res.render('dashboard/admin', {
        subjectsUpload,
        scheduleUpload,
        setup_done,
        type
    });
};