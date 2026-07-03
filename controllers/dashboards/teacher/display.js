const resolveUserModel = require('../../../utils/resolve-user-models');

exports.display = async (req, res) => {
    const userModel = resolveUserModel(req.session.user.role);
    const user = await userModel.findOne({code: req.session.user.code});
    const workPlace = user.workPlace;
    const isSetupDone = user.setup.done;
    const isFaceUploaded = user.setup.faceUploaded;

    res.render('dashboards/teacher',
        {
            popupMessage: null,
            popupType: null,
            isFaceUploaded,
            isSetupDone,
            workPlace,
        }
    );
}