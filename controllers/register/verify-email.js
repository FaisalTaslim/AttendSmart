const Org = require("../../models/organization");
const { sendRegistrationMail } = require("../../utils/send-emails");

exports.verify = async (req, res) => {
    try {
        const { token, role, code } = req.params;
        const org = await Org.findOne({
            code,
            "verification.token": token,
            "verification.status": "pending",
            "verification.expiresAt": { $gt: new Date() }
        });

        if (!org) {
            return res.send("Invalid or expired link!");
        }

        if (org.verification.status === "verified") {
            return res.send("Organization already verified");
        }

        const userName = org.admin[0].name;
        const email = org.admin[0].email;

        await sendRegistrationMail(email, userName, code, "Admin");

        org.verification.status = "verified";
        org.verification.token = null;
        org.verification.expiresAt = null;

        await org.save();
    }
    catch (err) {
        console.log(err);
    }

    res.send("Registration Successful! Check your registered email for login credentials");
};