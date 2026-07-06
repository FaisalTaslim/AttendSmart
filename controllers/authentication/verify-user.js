const resolveUserModel = require("../../utils/resolve-user-models");

const { sendRegistrationMail } = require("../../services/emails/send-registration-emails");
const validateFields = require('../../utils/validate-fields');

function verifyRequest(req) {
  const verify = {
    invalidFields: validateFields(Object.values(req.query)),
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error("Missing Fields!");
  }
}

function processData(req) {
  const { token, code } = req.query;

  return {
    search: {
      code,
      "verification.token": token,
      "verification.status": "pending",
      "verification.expiresAt": { $gt: new Date() },
    },

    verification: {
      status: "verified",
      token: null,
      expiresAt: null,
    },
  };
}

exports.request = async (req, res) => {
  try {
    verifyRequest(req);

    const data = processData(req);

    const role =
      req.query.role === "student"
        ? req.query.secondary_role
        : req.query.role;

    const Model = resolveUserModel(role);

    const user = await Model.findOneAndUpdate(
      data.search,
      {
        $set: {
          verification: data.verification,
        },
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.render("confirmation-pages/register_link_error");
    }

    await sendRegistrationMail(
      req.query.to,
      user.code,
      role
    );

    return res.render("confirmation-pages/register");
  } catch (err) {
    console.error(err);

    return res.render("confirmation-pages/register_link_error");
  }
};