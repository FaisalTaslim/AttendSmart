const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const Employee = require('../../models/users/employee');
const EmployeeSummary = require("../../models/statistics/employee-summary");
const OrgLog = require("../../models/statistics/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyEmail = require("../../utils/registration/verify-domains");
const moment = require("moment");

exports.register_emp = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
        const {
            org,
            name,
            employeeId,
            designation,
            workPlace,
            shift,
            contact,
            email,
            password,
            confirmPassword,
        } = req.body;

        if (password !== confirmPassword) {
            throw new Error("PASSWORD_MISMATCH");
        }

        if (!verifyEmail(email.toLowerCase())) {
            throw new Error("INVALID_EMAIL_DOMAIN");
        }

        const existingEmployee = await Employee.findOne(
            {
                org,
                email: email.toLowerCase().trim(),
                isDeleted: false,
            },
            null,
            { session }
        );

        if (existingEmployee) {
            throw new Error("ACCOUNT_EXISTS");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let code;
        let codeExists = true;

        while (codeExists) {
            code = generateCode(6, "numeric");
            const check = await Employee.findOne({ code });
            if (!check) codeExists = false;
        }

        const [employee] = await Employee.create(
            [
                {
                    org,
                    code,
                    name: name.trim(),
                    employeeId: employeeId.trim(),
                    designation: designation.trim(),
                    workPlace,
                    shift,
                    contact,
                    email: email.toLowerCase().trim(),
                    verification: {
                        status: "pending",
                        token: verificationToken,
                        expiresAt: tokenExpiry,
                    },
                    password: hashedPassword,
                    termsCheck: "accepted",
                },
            ],
            { session }
        );

        await EmployeeSummary.create(
            [
                {
                    org,
                    code: employee.code,
                    name: employee.name,
                    department: employee.designation,
                    shift: employee.shift,
                    month: moment().format("YYYY-MM"),
                },
            ],
            { session }
        );

        await OrgLog.findOneAndUpdate(
            { org },
            {
                $push: {
                    register: {
                        name: employee.name,
                        role: "employee",
                        id: employee.employeeId,
                        email: employee.email,
                    },
                },
            },
            { upsert: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        await sendVerificationEmail(
            employee.email,
            verificationToken,
            employee.code,
            "Employee",
            null
        );

        return res.render("index", {
            popupMessage: "Check your email to verify your account!",
            popupType: "info",
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        console.error(err);

        let message = "Registration failed. Please try again.";

        if (err.message === "PASSWORD_MISMATCH") message = "Password mismatch!";
        if (err.message === "INVALID_EMAIL_DOMAIN") message = "Use organization email only";
        if (err.message === "ACCOUNT_EXISTS") message = "Employee already registered";

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};