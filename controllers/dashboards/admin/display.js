const resolveUserModel = require('../../../utils/functions/resolve-user-models');

exports.display = async (req, res) => {
    const userModel = resolveUserModel(req.session.user.role);
    const user = await userModel.findOne({code: req.session.user.code});
    const orgType = user.orgType;
    const isSetupDone = user.setup.done;
    const isSubjectsUploaded = user.setup.subjectsUploaded;
    const isScheduleUploaded = user.setup.scheduleUploaded;

    res.render('dashboards/admin',
        {
            popupMessage: null,
            popupType: null,
            orgType,
            isSubjectsUploaded,
            isScheduleUploaded,
            isSetupDone,
        }
    );
}