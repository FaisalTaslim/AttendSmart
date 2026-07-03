const resolveUserModel = require("../../utils/resolve-user-models");
const generateCode = require("../../utils/generate-code");

exports.homepage = async (req, res) => {
  let popupType = req.query["popup-type"] ?? null;
  let popupMessage = req.query["popup-message"] ?? null;

  res.render("index", {
    popupMessage,
    popupType,
  });
};

exports.guidebook = async (req, res) => {
  res.render("guidebook");
};

exports.captureAttendanceWindow = async (req, res) => {
  const { user: isUser = null, type = null, dept = null, sessionCode = null, subject = null, key = null, shift = null } = req.query;
  let popupType = req.query["popup-type"] ?? null;
  let popupMessage = req.query["popup-message"] ?? null;

  const userModel = resolveUserModel(req.session.user.role);
  const user = await userModel.findOne({ code: req.session.user.code });


  res.render("dashboards/capture-attendance", {
    popupMessage,
    popupType,
    isUser,
    type,
    dept,
    sessionCode,
    subject,
    key,
    shift,
  });
};

exports.qrPage = async (req, res) => {
  const userModel = resolveUserModel(req.session.user.role);
  const user = await userModel.findOne({ code: req.session.user.code });
  const instigator = req.session.user.code;
  const instigatorName = user.name;
  let subject,
    dept,
    sessionCode = null;

  res.render("attendance/qr", {
    instigator: req.session.user.code,
    instigatorName,
    subject,
    dept,
    sessionCode,
    sessionMins: 15,
  });
};

exports.scanner = async (req, res) => {
  const role = req.session.user.role;

  res.render("attendance/scanner", {
    role,
    popupMessage: null,
    popupType: null,
  });
};
