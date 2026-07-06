const generateCode = require("../../utils/generate-code");

exports.request = async (req, res) => {
  try {
    const sessionKey = generateCode(8, "alphanumeric");

    res.json({
      success: true,
      sessionKey,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};