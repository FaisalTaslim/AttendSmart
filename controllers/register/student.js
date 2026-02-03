const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const CollegeStudent = require("../../models/users/college-student");
const SchoolStudent = require("../../models/users/school-student");
const Summary = require("../../models/statistics/student-summary");
const OrgLog = require("../../models/statistics/logs");
const generateCode = require("../../utils/functions/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/emails/send-emails");
const verifyEmail = require("../../utils/emails/verify-domains");
const moment = require("moment");


exports.register_clg = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
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
        let codeExists = true;


        if (password !== confirmPassword) throw new Error("PASSWORD_MISMATCH");
        if (!verifyEmail(email.toLowerCase())) throw new Error("INVALID_EMAIL_DOMAIN");

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

        while (codeExists) {
            code = generateCode(6, "numeric");
            const check = await CollegeStudent.findOne({ code });
            if (!check) codeExists = false;
        }

        const [student] = await CollegeStudent.create(
            [{
                org,
                code,
                name,
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
                password: hashedPassword,
                termsCheck: "accepted",
                setup: {
                    faceUploaded: false,
                }
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
                org: org,
                code: student.code,
                name: student.name,
                department: student.dept,
                subject: subject,
                month: moment().format("YYYY-MM"),
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
                        month: moment().format("YYYY-MM"),
                    }
                ],
                { session }
            );
        }

        await OrgLog.findOneAndUpdate(
            { org: org },
            {
                $push: {
                    register: {
                        name: student.name,
                        role: "student",
                        id: roll,
                        email: student.email.toLowerCase().trim()
                    }
                }
            },
            { upsert: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        await sendVerificationEmail(
            student.email,
            verificationToken,
            student.code,
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

        console.error(err);

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
    session.startTransaction();

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
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

        const normalizedName = name.trim().toLowerCase();
        const normalizedStandard = standard.trim().toLowerCase();
        let subjects = [];
        let code;
        let codeExists = true;

        if (password !== confirmPassword) throw new Error("PASSWORD_MISMATCH");
        if (!verifyEmail(email.toLowerCase())) throw new Error("INVALID_EMAIL_DOMAIN");

        const existing = await SchoolStudent.findOne(
            {
                name: normalizedName,
                roll: roll.trim(),
                standard: normalizedStandard,
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

        while (codeExists) {
            code = generateCode(6, "numeric");
            const check = await SchoolStudent.findOne({ code });
            if (!check) codeExists = false;
        }

        const [student] = await SchoolStudent.create(
            [{
                org,
                code,
                name: normalizedName,
                roll: roll.trim().toLowerCase(),
                standard: normalizedStandard,
                stream,
                contact,
                email: email.toLowerCase().trim(),
                subjects,
                verification: {
                    status: "pending",
                    token: verificationToken,
                    expiresAt: tokenExpiry
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
                org: org,
                code: student.code,
                name: student.name,
                department: student.standard,
                subject: subject,
                month: moment().format("YYYY-MM"),
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
                        department: student.standard,
                        subject: null,
                        month: moment().format("YYYY-MM"),
                    }
                ],
                { session }
            );

        }

        await OrgLog.findOneAndUpdate(
            { org },
            {
                $push: {
                    register: {
                        name: student.name,
                        role: "student",
                        id: roll,
                        email: student.email
                    }
                }
            },
            { upsert: true, session }
        );

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

        console.error(err);

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