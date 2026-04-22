const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const OrgLog = require("../../models/logs/logs");
const generateCode = require("../../utils/functions/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/emails/send-emails");
const verifyDomains = require("../../utils/emails/verify-domains");
const mongoose = require("mongoose");


exports.register = async (req, res) => {
    const session = await mongoose.startSession();
    let setup;
    let successMessage = "Registration successful! Please verify your email.";
    session.startTransaction();

    try {
        const {
            admin,
            organization,
            branch,
            address,
            type,
            website,
            attendanceMethod,
            confirmPassword,
            termsCheck
        } = req.body;

        const adminData = admin?.[0];

        if (!adminData) {
            throw new Error("Admin details missing");
        }

        const {
            name,
            adminId,
            contact,
            email,
            password
        } = adminData;

        if (!termsCheck) {
            throw new Error("You must accept the Terms & Conditions");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        if (!verifyDomains(email)) {
            throw new Error("Please use your organization email address");
        }

        const existingOrg = await Org.findOne({ org: organization }).session(session);

        const hashedPassword = await bcrypt.hash(password, 12);

        if (existingOrg) {
            const adminExists = existingOrg.admin?.some(existing =>
                existing.email === email || existing.adminId === adminId
            );

            if (adminExists) {
                throw new Error("Admin already registered for this organization");
            }

            await Org.updateOne(
                { _id: existingOrg._id },
                {
                    $push: {
                        admin: {
                            name,
                            adminId,
                            contact,
                            email,
                            password: hashedPassword
                        }
                    }
                },
                { session }
            );

            await OrgLog.findOneAndUpdate(
                { org: existingOrg.code },
                {
                    $push: {
                        register: {
                            name,
                            role: "admin",
                            id: adminId,
                            email
                        }
                    }
                },
                { upsert: true, session }
            );

            successMessage = "Registration successful! You can now log in.";
        } else {
            let code;
            let codeExists = true;

            while (codeExists) {
                code = generateCode(6, "numeric");
                const check = await Org.findOne({ code }).session(session);
                if (!check) codeExists = false;
            }

            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

            if (type === "corporate") {
                setup = true;
            } else {
                setup = false;
            }

            await Org.create(
                [{
                    code,
                    org: organization,
                    branch,
                    type,
                    address,
                    website,
                    attendanceMethod,
                    agreement: true,
                    admin: [
                        {
                            name,
                            adminId,
                            contact,
                            email,
                            password: hashedPassword
                        }
                    ],
                    verification: {
                        status: "pending",
                        token,
                        expiresAt
                    },
                    setup_done: setup
                }],
                { session }
            );

            await OrgLog.create(
                [{
                    org: code,
                    register: [
                        {
                            name,
                            role: "admin",
                            id: adminId,
                            email
                        }
                    ]
                }],
                { session }
            );

            await sendVerificationEmail(
                email,
                token,
                code,
                "admin",
                null
            );
        }

        await session.commitTransaction();
        session.endSession();

        return res.render("index", {
            popupMessage: successMessage,
            popupType: "success"
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error("Admin Registration Error:", err);

        return res.render("index", {
            popupMessage: err.message || "Registration failed. Please try again.",
            popupType: "error"
        });
    }
};
