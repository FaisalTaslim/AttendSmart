const Org = require("../../models/users/organization");
const collegeStudent = require("../../models/users/college-student");
const schoolStudent = require("../../models/users/school-student");
const Employee = require("../../models/users/employee");
const { sendRegistrationMail } = require("../../utils/emails/send-emails");

exports.verify = async (req, res) => {
    try {
        console.log("hitting the verify user route.")
        const { token, role, code, secondary_role } = req.params;

        if (role == "admin") {
            const org = await Org.findOne({
                code,
                "verification.token": token,
                "verification.status": "pending",
                "verification.expiresAt": { $gt: new Date() }
            });

            if (!org) {
                return res.render('confirmation-pages/register_link_error')
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
                return res.render('confirmation-pages/register_link_error')
            }

            const userName = student.name;
            const email = student.email;

            await sendRegistrationMail(email, userName, code, "Student");

            student.verification.status = "verified";
            student.verification.token = null;
            student.verification.expiresAt = null;

            await student.save();

            res.render('confirmation-pages/register');
        }
        else if (role === "Employee") {
            const emp = await Employee.findOne({
                code,
                "verification.token": token,
                "verification.status": "pending",
                "verification.expiresAt": { $gt: new Date() }
            });

            if (!emp) {
                return res.render("confirmation-pages/register_link_error");
            }

            const userName = emp.name;
            const email = emp.email;

            await sendRegistrationMail(email, userName, code, "Employee");

            emp.verification.status = "verified";
            emp.verification.token = null;
            emp.verification.expiresAt = null;

            await emp.save();

            return res.render("confirmation-pages/register");
        }
    }
    catch (err) {
        console.log(err);
    }
};