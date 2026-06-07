const resolveUserModel = require('../../utils/functions/resolve-user-models');

exports.homepage = async (req, res) => {
    console.log(req.session.user.role);
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
    let subject = req.query.subject;
    let dept = req.query.dept ?? null;
    const sessionCode = req.query.session;
    const key = req.query.key;

    const userModel = resolveUserModel(role);
    const user = await userModel.findOne({code: req.session.user.code});

    if (!subject) subject = null;

    res.render('dashboards/capture-attendance', 
        {
            popupMessage: null,
            popupType: null,
            isUser,
            type,
            dept,
            sessionCode,
            subject,
            key,
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
