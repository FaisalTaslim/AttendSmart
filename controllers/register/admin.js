const bcrypt = require("bcrypt");
const Org = require("../../models/users/organization");
const OrgLog = require("../../models/statistics/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyEmail = require("../../utils/registration/verify-domains");
const XLSX = require("xlsx");
const subjectSchema = require("../../utils/registration/validate-subjects");
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

function parseSubjectsFromExcel(file) {
    const workbook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (!rows.length) {
        throw new Error("EMPTY_EXCEL");
    }

    const subjects = [];
    const errors = [];

    rows.forEach((row, index) => {
        try {
            const parsed = {
                class: String(row.class).trim(),
                majors: row.majors
                    ? String(row.majors).split(",").map(s => s.trim())
                    : [],
                optionals: row.optionals
                    ? String(row.optionals).split(",").map(s => s.trim())
                    : [],
                minors: row.minors
                    ? String(row.minors).split(",").map(s => s.trim())
                    : [],
            };

            const { error, value } = subjectSchema.validate(parsed);

            if (error) {
                throw new Error(error.details[0].message);
            }

            subjects.push(value);
        } catch (err) {
            errors.push({
                row: index + 2,
                error: err.message
            });
        }
    });

    if (errors.length) {
        throw new Error(
            `EXCEL_VALIDATION_FAILED:${JSON.stringify(errors)}`
        );
    }

    return subjects;
}

const ERROR_MESSAGES = {
    INVALID_EMAIL_DOMAIN: "Please use your organization email address",
    PASSWORD_MISMATCH: "Password mismatch!",
    EXCEL_REQUIRED: "Please upload the subjects Excel file",
    EMPTY_EXCEL: "Uploaded Excel file is empty",
};


exports.register = async (req, res) => {
    console.log("REQ.FILE:", req.file);
    console.log("REQ.BODY:", req.body);
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

        if (!req.file) {
            throw new Error("EXCEL_REQUIRED");
        }

        const subjects = parseSubjectsFromExcel(req.file);

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
            subjects,
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

        let message =
            ERROR_MESSAGES[err.message] ||
            (err.message?.startsWith("EXCEL_VALIDATION_FAILED")
                ? "Excel format is invalid. Please check the guide."
                : "Registration failed. Please try again.");

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};