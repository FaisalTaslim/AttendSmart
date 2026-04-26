const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const CollegeStudent = require("../../models/users/college-student");
const SchoolStudent = require("../../models/users/school-student");
const Summary = require("../../models/statistics/student-summary");
const RegisterLog = require('../../models/logs/register');
const OrgLog = require("../../models/logs/logs");
const generateCode = require("../../utils/functions/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/emails/send-register-emails");
const getMonthKey = require('../../utils/functions/getMonthKey');
const verifyDomains = require("../../utils/emails/verify-domains");

exports.register_clg = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const month = getMonthKey();

    const {
        name,
        roll,
        dept,
        contact,
        email,
        org,
        password,
        confirmPassword,
    } = req.body;

    const {
        majors = [],
        minors = [],
        optionals = []
    } = req.body;

    let code;
    let subjects = [];

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
        if (password !== confirmPassword) throw new Error("PASSWORD_MISMATCH");
        if (!verifyDomains(email.toLowerCase())) throw new Error("INVALID_EMAIL_DOMAIN");

        const existing = await CollegeStudent.findOne(
            { email: email.toLowerCase().trim(), isDeleted: false },
            null,
            { session }
        );

        if (existing) throw new Error("ACCOUNT_EXISTS");

        subjects = [...majors, ...minors, ...optionals]
            .map(s => s.trim())
            .filter(Boolean);

        if (subjects.length === 0) throw new Error("NO_SUBJECTS");


        const hashedPassword = await bcrypt.hash(password, 10);
        code = generateCode(6, "numeric");

        const [student] = await CollegeStudent.create(
            [{
                org,
                code,
                name: name.toLowerCase().trim(),
                roll,
                dept,
                contact,
                email: email.toLowerCase().trim(),
                subjects,
                verification: {
                    status: "pending",
                    token: verificationToken,
                    expiresAt: tokenExpiry
                },
                settings: {
                    theme: 'light',
                },
                password: hashedPassword,
                termsCheck: "accepted",
                setup: {
                    faceUploaded: false,
                }
            }],
            { session }
        );

        const attendanceType = (await Org.findOne({ code: org }).session(session))?.attendanceMethod;

        if (attendanceType === 'subject-wise') {
            const summaries = subjects.map(subject => ({
                org: org,
                code,
                name: name.toLowerCase().trim(),
                department: dept,
                subject: subject,
                month,
            }));

            await Summary.insertMany(summaries, { session });
        }
        else if (attendanceType === 'one-time') {
            await Summary.create(
                [
                    {
                        org: org,
                        code: student.code,
                        name: student.name,
                        department: student.dept,
                        subject: null,
                        month,
                    }
                ],
                { session }
            );
        }

        await RegisterLog.create([{
            type: 'success',
            org: org,
            name: name.toLowerCase().trim(),
            id: roll,
            role: 'student',
            email: email.toLowerCase().trim(),
            contact,
            message: 'Student registered successfully!'
        }],
            { session })

        await session.commitTransaction();
        session.endSession();

        await sendVerificationEmail(
            email.toLowerCase().trim(),
            verificationToken,
            code,
            "Student",
            "collegeStudent"
        );

        return res.render("index", {
            popupMessage: "Check your email!",
            popupType: "info",
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        await RegisterLog.create({
            type: 'failed',
            org: org || 'null',
            name: name || 'null',
            id: roll || 'null',
            role: 'student',
            email: email?.toLowerCase().trim() || 'null',
            contact: contact || 'null',
            message: err.message,
        })

        let message = "Registration failed. Please try again.";

        if (err.message === "PASSWORD_MISMATCH") message = "Password mismatch!";
        if (err.message === "INVALID_EMAIL_DOMAIN") message = "Use organization email only";
        if (err.message === "ACCOUNT_EXISTS") message = "Account already exists";
        if (err.message === "ORG_NOT_FOUND") message = "Organization not found";
        if (err.message === "NO_SUBJECTS") message = "Failed registration. Try again!"

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};

exports.register_sch = async (req, res) => {
    const session = await mongoose.startSession();
    const month = getMonthKey();

    const {
        org,
        name,
        roll,
        standard,
        stream,
        contact,
        email,
        password,
        confirmPassword,
    } = req.body;

    const {
        majors = [],
        minors = [],
        optionals = []
    } = req.body;

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
    let code;

    session.startTransaction();

    try {
        let subjects = [];

        if (password !== confirmPassword) throw new Error("PASSWORD_MISMATCH");
        if (!verifyDomains(email.toLowerCase())) throw new Error("INVALID_EMAIL_DOMAIN");

        const existing = await SchoolStudent.findOne(
            {
                name: name.toLowerCase().trim(),
                roll: roll.trim(),
                standard: standard,
                isDeleted: false
            },
            null,
            { session }
        );

        if (existing) throw new Error("ACCOUNT_EXISTS");

        const hashedPassword = await bcrypt.hash(password, 10);

        subjects = [...majors, ...minors, ...optionals]
            .map(s => s.trim())
            .filter(Boolean);

        if (subjects.length === 0) throw new Error("NO_SUBJECTS");

        code = generateCode(6, "numeric");

        const [student] = await SchoolStudent.create(
            [{
                org,
                code,
                name: name.toLowerCase().trim(),
                roll: roll.trim().toLowerCase(),
                standard: standard.trim(),
                stream,
                contact,
                email: email.toLowerCase().trim(),
                subjects,
                verification: {
                    status: "pending",
                    token: verificationToken,
                    expiresAt: tokenExpiry
                },
                settings: {
                    theme: 'light'
                },
                setup: {
                    faceUploaded: false,
                },
                password: hashedPassword,
                termsCheck: "accepted"
            }],
            { session }
        );

        const attendanceType = (await Org.findOne(
            { code: org },
            null,
            { session }
        ))?.attendanceMethod;

        if (attendanceType === 'subject-wise') {
            const summaries = subjects.map(subject => ({
                org,
                code,
                name: name.toLowerCase().trim(),
                department: standard,
                subject: subject,
                month,
            }));

            await Summary.insertMany(summaries, { session });
        }
        else if (attendanceType === 'one-time') {
            await Summary.create(
                [
                    {
                        org,
                        code,
                        name: name.toLowerCase().trim(),
                        department: standard,
                        subject: null,
                        month,
                    }
                ],
                { session }
            );

        }

        await RegisterLog.create([{
            type: 'success',
            org: org,
            name: name.toLowerCase().trim(),
            id: roll.trim(),
            role: 'student',
            email: email.toLowerCase().trim(),
            contact,
            message: 'Student registered successfully!'
        }],
            { session })

        await session.commitTransaction();
        session.endSession();

        await sendVerificationEmail(
            student.email,
            verificationToken,
            student.code,
            "Student",
            "schoolStudent"
        );

        return res.render("index", {
            popupMessage: "Check your email!",
            popupType: "info",
        });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();

        await RegisterLog.create([{
            type: 'failed',
            org: org,
            name: name?.toLowerCase().trim() || 'null',
            id: roll?.trim() || 'null',
            role: 'student',
            email: email?.toLowerCase().trim() || 'null',
            contact: contact || 'null',
            message: 'Student registration failed!'
        }],
            { session })

        let message = "Registration failed. Please try again.";

        if (err.message === "PASSWORD_MISMATCH") message = "Password mismatch!";
        if (err.message === "INVALID_EMAIL_DOMAIN") message = "Use organization email only";
        if (err.message === "ACCOUNT_EXISTS") message = "Account already exists";
        if (err.message === "ORG_NOT_FOUND") message = "Organization not found";

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};