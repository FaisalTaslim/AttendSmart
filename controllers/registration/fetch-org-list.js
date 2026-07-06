const Org = require("../../models/users/organization");

exports.request = async (req, res) => {
  try {
    const { type } = req.query;
    const allowedTypes = new Set(["school", "college", "corporate"]);

    if (type && !allowedTypes.has(type)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid organization type" });
    }

    const query = {
      isDeleted: false,
      "setup.done": true,
      ...(type ? { type } : {}),
    };

    const orgs = await Org.find(query);

    res.json({
      success: true,
      organizations: orgs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
