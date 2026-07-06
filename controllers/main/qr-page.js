const resolveUserModel = require("../../utils/resolve-user-models");

exports.display = async (req, res) => {
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