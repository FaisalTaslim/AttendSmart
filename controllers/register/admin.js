const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const OrgLog = require("../../models/statistics/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyDomains = require("../../utils/registration/verify-domains");
const mongoose = require("mongoose");


exports.register = async (req, res) => {
    const session = await mongoose.startSession();
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

        // Basic validations
        if (!termsCheck) {
            throw new Error("You must accept the Terms & Conditions");
        }

        if (password !== confirmPassword) {
            throw new Error("Passwords do not match");
        }

        if (!verifyDomains(email)) {
            throw new Error("Please use your organization email address");
        }

        // Check existing organization
        const existingOrg = await Org.findOne({ org: organization });
        if (existingOrg) {
            throw new Error("Organization already registered");
        }

        // Generate unique 6-digit numeric code
        let code;
        let codeExists = true;

        while (codeExists) {
            code = generateCode(6, "numeric"); // assuming numeric-only generation
            const check = await Org.findOne({ code });
            if (!check) codeExists = false;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Verification token
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Create organization
        const orgDoc = await Org.create(
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
                }
            }],
            { session }
        );

        // Create logs document
        const logDoc = await OrgLog.create(
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

        // Send verification email
        await sendVerificationEmail(
            email,
            token,
            code,
            "admin",
            null
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        return res.render("index", {
            popupMessage: "Registration successful! Please verify your email.",
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