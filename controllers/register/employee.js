const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const Employee = require('../../models/users/employee');
const EmployeeSummary = require("../../models/statistics/employee-summary");
const RegisterLog = require('../../models/logs/register');
const generateCode = require("../../utils/functions/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/emails/send-register-emails");
const verifyDomains = require("../../utils/emails/verify-domains");
const getMonthKey = require('../../utils/functions/getMonthKey');

exports.register_emp = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    const month = getMonthKey();
    let code;

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

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
        if ((password !== confirmPassword) || !(verifyDomains(email.toLowerCase()))) {
            throw new Error("SUSPICIOUS_ACTIVITY");
        }

        const existingEmployee = await Employee.findOne(
            {
                org,
                name: name.toLowerCase().trim(),
                employeeId: employeeId.toLowerCase().trim(),
                email: email.toLowerCase().trim(),
                isDeleted: false,
            },
            { session }
        );

        if (existingEmployee) {
            throw new Error("ACCOUNT_EXISTS");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        code = generateCode(6, "numeric");

        const employee = await Employee.create(
            [
                {
                    org,
                    code,
                    name: name.toLowerCase().trim(),
                    employeeId: employeeId.toLowerCase().trim(),
                    designation: designation.toLowerCase().trim(),
                    workPlace,
                    shift,
                    contact,
                    email: email.toLowerCase().trim(),
                    verification: {
                        status: "pending",
                        token: verificationToken,
                        expiresAt: tokenExpiry,
                    },
                    setup: {
                        faceUploaded: false,
                    },
                    settings: {
                        theme: 'light',
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
                    code,
                    name: name.toLowerCase().trim(),
                    department: designation.toLowerCase().trim(),
                    shift,
                    month,
                },
            ],
            { session }
        );

        await RegisterLog.create([{
            type: 'success',
            org: org,
            name: name.toLowerCase().trim(),
            id: employeeId.toLowerCase().trim(),
            role: 'employee',
            email: email.toLowerCase().trim(),
            contact,
            message: 'Employee registered successfully!'
        }],
            { session })

        await session.commitTransaction();
        session.endSession();

        await sendVerificationEmail(
            email.toLowerCase().trim(),
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

        await RegisterLog.create({
            type: 'failed',
            org: org || 'null',
            name: name || 'null',
            id: employeeId?.trim().toLowerCase() || 'null',
            role: 'employee',
            email: email?.toLowerCase().trim() || 'null',
            contact: contact || 'null',
            message: err.message,
        })

        let message = "Registration failed. Please try again.";

        if (err.message === "SUSPICIOUS_ACTIVITY") message = "Suspicious activity detected! Failed to register.";
        if (err.message === "ACCOUNT_EXISTS") message = "Employee already registered";

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};