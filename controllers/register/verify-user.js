const Org = require("../../models/users/organization");
const collegeStudent = require("../../models/users/college-student");
const schoolStudent = require("../../models/users/school-student");
const { sendRegistrationMail } = require("../../utils/send-emails");

exports.verify = async (req, res) => {
    try {
        const { token, role, code, secondary_role } = req.params;

        if (role == "Admin") {
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
        else if (role == "Student") {
            let student;

            if (secondary_role == "collegeStudent") {
                student = await collegeStudent.findOne({
                    code,
                    "verification.token": token,
                    "verification.status": "pending",
                    "verification.expiresAt": { $gt: new Date() }
                });
            }
            else {
                student = await schoolStudent.findOne({
                    code,
                    "verification.token": token,
                    "verification.status": "pending",
                    "verification.expiresAt": { $gt: new Date() }
                });
            }

            if (!student) {
                return res.send("Invalid or expired link!");
            }

            if (student.verification.status === "verified") {
                return res.send("Student already verified");
            }

            const userName = student.name;
            const email = student.email;

            await sendRegistrationMail(email, userName, code, "Student");

            student.verification.status = "verified";
            student.verification.token = null;
            student.verification.expiresAt = null;

            await student.save();
        }
    }
    catch (err) {
        console.log(err);
    }

    res.send("Registration Successful! Check your registered email for login credentials");
};