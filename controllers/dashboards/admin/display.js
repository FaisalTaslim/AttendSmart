const resolveUserModel = require("../../../utils/functions/resolve-user-models");
const getAdminRenderData = require("../../../utils/render-dashboards/admin-render-data");

exports.display = async (req, res) => {
  const userModel = resolveUserModel(req.session.user.role);
  const user = await userModel.findOne({ code: req.session.user.code });
  const data = await getAdminRenderData(user);
  res.render("dashboards/admin", data);
};