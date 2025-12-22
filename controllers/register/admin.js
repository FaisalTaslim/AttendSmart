const bcrypt = require("bcrypt");
const Org = require("../../models/organization");
const OrgLog = require("../../models/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyEmail = require("../../utils/verify-domains");

async function createOrgWithUniqueCode(orgData) {
    while (true) {
        try {
            const code = generateCode(6, "numeric");
            const org = new Org({ ...orgData, code });
            await org.save();
            return org;
        } catch (err) {
            if (err.code === 11000) {
                continue;
            }
            throw err;
        }
    }
}

exports.admin = async (req, res) => {
    let createdOrg = null;
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

    try {
        const {
            organization,
            branch,
            type,
            address,
            website,
            expectedEmployees,
            expectedStudents,
            confirmPassword,
        } = req.body;

        const {
            name,
            adminId,
            contact,
            email,
            password,
        } = req.body.admin[0];

        if (!verifyEmail((email.toLowerCase()))) {
            return res.render("index", {
                popupMessage: "Please use your organization email address",
                popupType: "error",
            });
        }

        if (password !== confirmPassword) {
            return res.render("index", {
                popupMessage: "Password mismatch!",
                popupType: "error",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        createdOrg = await createOrgWithUniqueCode({
            org: organization.toLowerCase().trim(),
            branch: branch.toLowerCase().trim(),
            type,
            address: address.toLowerCase().trim(),
            website: website?.toLowerCase().trim() || "",
            exp_employee: expectedEmployees,
            exp_students: expectedStudents || 0,
            agreement: true,
            admin: [
                {
                    name,
                    adminId,
                    contact,
                    email,
                    password: hashedPassword,
                }
            ],
            departments: {
                school: [],
                college: [],
                employees: []
            },
            verification: {
                status: "pending",
                token: verificationToken,
                expiresAt: tokenExpiry
            }
        });

        await OrgLog.create({
            org: createdOrg.code,
            registerLogs: [`Organization registered by ${name}`]
        });

        await sendVerificationEmail(email, verificationToken, createdOrg.code, "Admin");

        return res.render("index", {
            popupMessage: "Check your email!",
            popupType: "info",
        });

    } catch (err) {
        console.error(err);
        if (createdOrg) {
            await Org.deleteOne({ _id: createdOrg._id });
        }

        return res.status(500).render("index", {
            popupMessage: "Registration failed. Please try again.",
            popupType: "error",
        });
    }
};