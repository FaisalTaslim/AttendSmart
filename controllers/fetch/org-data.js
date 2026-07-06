const Org = require("../../models/users/organization");
const generateCode = require("../../utils/generate-code");

exports.request = async (req, res) => {
  try {
    const orgs = await Org.find(
      {
        isDeleted: false,
        "setup.done": true,
      },
      {
        org: 1,
        branch: 1,
        code: 1,
        subjects: 1,
        _id: 0,
      },
    );

    res.json({
      success: true,
      organizations: orgs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};