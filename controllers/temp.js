const resolveUserModel = require("../utils/functions/resolve-user-models");

exports.updateDatabase = async (req, res) => {
  try {
    console.log("Updating database...");
    const Model = resolveUserModel("employee");
    const users = await Model.find();

    for (const user of users) {
      user.approvalStatus = "approved";
      await user.save();
    }

    return res.json({
      success: true,
      message: `${users.length} users updated`,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
