const Org = require('../../models/users/organization');

exports.display = async (req, res) => {
  let popupType, popupMessage;

  popupType = req.query["popup-type"] ?? null;
  popupMessage = req.query["popup-message"] ?? null;

  const organizations = await Org.find(
    {},
    "code org branch type subjects"
  ).lean();

  res.render("index", {
    popupMessage,
    popupType,
    organizations,
  });
};