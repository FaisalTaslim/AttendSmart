const resolveUserModel = require("../../utils/functions/resolve-user-models");
const generateCode = require("../../utils/functions/generate-code");

exports.homepage = async (req, res) => {
  res.render("index", {
    popupMessage: null,
    popupType: null,
  });
};

exports.guidebook = async (req, res) => {
  res.render("guidebook");
};

exports.captureAttendanceWindow = async (req, res) => {
  const {
    isUser = null,
    type = null,
    dept = null,
    sessionCode = null,
    subject = null,
    key = null,
    shift = null,
  } = {};

  const userModel = resolveUserModel(role);
  const user = await userModel.findOne({ code: req.session.user.code });

  if (!subject) subject = null;
  if (!key) key = null;

  res.render("dashboards/capture-attendance", {
    popupMessage: null,
    popupType: null,
    isUser,
    type,
    dept,
    sessionCode,
    subject,
    key,
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
