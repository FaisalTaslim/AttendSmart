const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const OrgLog = require("../../models/statistics/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyEmail = require("../../utils/verify-domains");
const mongoose = require("mongoose");

async function createOrgWithUniqueCode(orgData) {
    while (true) {
        try {
            const code = generateCode(6, "numeric");
            const org = new Org({ ...orgData, code });
            await org.save();
            return org;
        } catch (err) {
            if (err.code === 11000) continue;
            throw err;
        }
    }
}

exports.register = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
        const {
            organization,
            branch,
            type,
            address,
            website,
            confirmPassword,
        } = req.body;

        const {
            name,
            adminId,
            contact,
            email,
            password,
        } = req.body.admin[0];

        if (!verifyEmail(email.toLowerCase().trim())) {
            throw new Error("INVALID_EMAIL_DOMAIN");
        }

        if (password !== confirmPassword) {
            throw new Error("PASSWORD_MISMATCH");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createdOrg = await createOrgWithUniqueCode({
            org: organization.toLowerCase().trim(),
            branch: branch.toLowerCase().trim(),
            type,
            address: address.toLowerCase().trim(),
            website: website?.toLowerCase().trim() || "",
            agreement: true,
            admin: [
                {
                    name,
                    adminId,
                    contact,
                    email: email.toLowerCase().trim(),
                    password: hashedPassword,
                }
            ],
            verification: {
                status: "pending",
                token: verificationToken,
                expiresAt: tokenExpiry
            }
        }, session);

        await OrgLog.create(
            [
                {
                    org: createdOrg.code,
                    register: [
                        {
                            name,
                            role: "admin",
                            id: adminId,
                            email: email.toLowerCase().trim()
                        }
                    ]
                }
            ],
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        await sendVerificationEmail(email, verificationToken, createdOrg.code, "Admin");

        return res.render("index", {
            popupMessage: "Check your email!",
            popupType: "info",
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error(err);

        let message = "Registration failed. Please try again.";

        if (err.message === "INVALID_EMAIL_DOMAIN") {
            message = "Please use your organization email address";
        } else if (err.message === "PASSWORD_MISMATCH") {
            message = "Password mismatch!";
        }

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};