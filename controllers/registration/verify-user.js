const resolveUserModel = require("../../utils/resolve-user-models");
const { sendRegistrationMail } = require("../../services/emails/send-registration-emails");

exports.verify = async (req, res) => {
  try {
    console.log("Hitting verify user route");

    const { token, role, code, secondary_role } = req.params;
    const actualRole = role === "student" ? secondary_role : role;

    const Model = resolveUserModel(actualRole);

    if (!Model) {
      return res.render("confirmation-pages/register_link_error");
    }

    const user = await Model.findOne({
      code,
      "verification.token": token,
      "verification.status": "pending",
      "verification.expiresAt": { $gt: new Date() },
    });

    if (!user) {
      return res.render("confirmation-pages/register_link_error");
    }

    let userName;
    let email;
    let mailRole;

    if (actualRole === "admin") {
      userName = user.admin[user.admin.length-1].name;
      email = user.admin[user.admin.length-1].email;
      mailRole = "Admin";
    } else {
      userName = user.name;
      email = user.email;

      if (actualRole === "employee") {mailRole = "Employee";} 
      else {mailRole = "Student";}
    }

    await sendRegistrationMail(email, userName, code, mailRole);

    user.verification.status = "verified";
    user.verification.token = null;
    user.verification.expiresAt = null;

    await user.save();

    return res.render("confirmation-pages/register");
  } catch (err) {
    console.error(err);

    return res.render("confirmation-pages/register_link_error");
  }
};
