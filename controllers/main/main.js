const resolveUserModel = require('../../utils/functions/resolve-user-models');

exports.homepage = async (req, res) => {
    res.render('index', {
        popupMessage: null,
        popupType: null
    });
}

exports.guidebook = async (req, res) => {
    res.render('guidebook')
}

exports.captureAttendanceWindow = async (req, res) => {
    const role = req.session.user.role;
    const isUser = req.query.for;
    const type = req.query.type;
    let dept = req.query.dept ?? null;
    const sessionCode = req.query.session;


    const userModel = resolveUserModel(role);
    const user = await userModel.findOne({code: req.session.user.code});

    res.render('dashboards/capture-attendance', 
        {
            popupMessage: null,
            popupType: null,
            isUser,
            type,
            dept,
            sessionCode,
        }
    );
}

exports.qrPage = async (req, res) => {
  const instigator = req.query.instigator;
  const subject = req.query.subject;
  const dept = req.query.dept;
  const sessionCode = req.query['session-code'];

    res.render('attendance/qr', {
        instructor: instigator,
        subject,
        dept,
        sessionCode,
        sessionMins: 15,
    });
}

exports.scanner = async(req, res) => {
    const role = req.session.user.role;

    res.render('attendance/scanner', {role});
}
