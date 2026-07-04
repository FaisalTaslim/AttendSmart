const resolveUserModel = require("../../utils/resolve-user-models");
const CollegeStudent = require('../../models/users/college-student');
const SchoolStudent = require('../../models/users/school-student');
const Employee = require('../../models/users/employee');
const Org = require('../../models/users/organization');

const { sendRegistrationMail } = require("../../services/emails/send-registration-emails");
const validateFields = require('../../utils/validate-fields');

function verifyRequest(req) {
  const verify = {
    invalidFields: validateFields(Object.values(req.params)),
  };

  if (!Object.values(verify).every(Boolean)) {
    throw new Error("Missing Fields!");
  }
}

async function processData(req) {
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
exports.verify = async (req, res) => {
  try {
    verifyRequest(req);

    const data = await processData(req);

    const role =
      req.params.role === "student"
        ? req.params.secondary_role
        : req.params.role;

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