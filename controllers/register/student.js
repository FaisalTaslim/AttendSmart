const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Org = require("../../models/users/organization");
const CollegeStudent = require("../../models/users/college-student");
const SchoolStudent = require("../../models/users/school-student");
const Summary = require("../../models/statistics/student-summary");
const OrgLog = require("../../models/statistics/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyEmail = require("../../utils/verify-domains");
const moment = require("moment");

async function createCollegeStudentWithUniqueCode(data, session) {
    while (true) {
        try {
            const code = generateCode(6, "numeric");
            const student = new CollegeStudent({ ...data, code });
            await student.save({ session });
            return student;
        } catch (err) {
            if (err.code === 11000) continue;
            throw err;
        }
    }
}

async function createSchoolStudentWithUniqueCode(data, session) {
    while (true) {
        try {
            const code = generateCode(6, "numeric");
            const student = new SchoolStudent({ ...data, code });
            await student.save({ session });
            return student;
        } catch (err) {
            if (err.code === 11000) continue;
            throw err;
        }
    }
}

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
            orgName,
            orgBranch,
            subjects,
            password,
            confirmPassword,
            faceDescriptor
        } = req.body;


        if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
            throw new Error("INVALID_FACE_DATA");
        }

        if (!Array.isArray(subjects) || subjects.length === 0) {
            throw new Error("NO_SUBJECTS");
        }


        if (password !== confirmPassword) {
            throw new Error("PASSWORD_MISMATCH");
        }

        if (!verifyEmail(email.toLowerCase())) {
            throw new Error("INVALID_EMAIL_DOMAIN");
        }

        const existing = await CollegeStudent.findOne(
            { email: email.toLowerCase().trim(), isDeleted: false },
            null,
            { session }
        );

        if (existing) {
            throw new Error("ACCOUNT_EXISTS");
        }

        const org = await Org.findOne(
            {
                org: orgName.toLowerCase().trim(),
                branch: orgBranch.toLowerCase().trim()
            },
            null,
            { session }
        );

        if (!org) {
            throw new Error("ORG_NOT_FOUND");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await createCollegeStudentWithUniqueCode({
            org: org.code,
            name,
            roll,
            dept,
            contact,
            email: email.toLowerCase(),
            subjects,
            faceData: { descriptors: [faceDescriptor] },
            verification: {
                status: "pending",
                token: verificationToken,
                expiresAt: tokenExpiry
            },
            password: hashedPassword,
            termsCheck: "accepted"
        }, session);


        const subjectList = (Array.isArray(subjects) ? subjects : [subjects])
            .filter(s => s && s.trim())
            .map(s => s.toLowerCase());

        const summaries = subjectList.map(subject => ({
            org: org.code,
            personType: "student",
            code: student.code,
            name: student.name,
            department: student.dept,
            subject: subject,
            month: moment().format("YYYY-MM"),
        }));

        await Summary.insertMany(summaries, { session });

        await OrgLog.findOneAndUpdate(
            { org: org.code },
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

        await Org.updateOne(
            { code: org.code },
            { $addToSet: { "departments.college": dept.toLowerCase() } },
            { session }
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
        if (err.message === "INVALID_FACE_DATA") message = "Invalid face data";
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
            userName,
            roll,
            standard,
            contact,
            email,
            orgName,
            orgBranch,
            subjects,
            password,
            confirmPassword,
            faceDescriptor
        } = req.body;

        const normalizedName = userName.trim().toLowerCase();
        const normalizedStandard = standard.trim().toLowerCase();

        if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
            throw new Error("INVALID_FACE_DATA");
        }

        if (!Array.isArray(subjects) || subjects.length === 0) {
            throw new Error("NO_SUBJECTS");
        }

        if (password !== confirmPassword) {
            throw new Error("PASSWORD_MISMATCH");
        }

        if (!verifyEmail(email.toLowerCase())) {
            throw new Error("INVALID_EMAIL_DOMAIN");
        }

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

        if (existing) {
            throw new Error("ACCOUNT_EXISTS");
        }

        const org = await Org.findOne(
            {
                org: orgName.toLowerCase().trim(),
                branch: orgBranch.toLowerCase().trim(),
            },
            null,
            { session }
        );

        if (!org) {
            throw new Error("ORG_NOT_FOUND");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const student = await createSchoolStudentWithUniqueCode({
            org: org.code,
            name: normalizedName,
            roll: roll.trim(),
            standard: normalizedStandard,
            contact,
            email: email.toLowerCase().trim(),
            subjects,
            faceData: { descriptors: [faceDescriptor] },
            verification: {
                status: "pending",
                token: verificationToken,
                expiresAt: tokenExpiry
            },
            password: hashedPassword,
            termsCheck: "accepted"
        }, session);


        const subjectList = subjects
            .filter(s => s && s.trim())
            .map(s => s.toLowerCase());

        const summaries = subjectList.map(subject => ({
            org: org.code,
            personType: "student",
            code: student.code,
            name: student.name,
            department: student.standard,
            subject,
            month: moment().format("YYYY-MM"),
        }));

        await Summary.insertMany(summaries, { session });

        await OrgLog.findOneAndUpdate(
            { org: org.code },
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

        await Org.updateOne(
            { code: org.code },
            { $addToSet: { "departments.school": standard.toLowerCase() } },
            { session }
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
        if (err.message === "INVALID_FACE_DATA") message = "Invalid face data";
        if (err.message === "NO_SUBJECTS") message = "Please enter at least one subject";

        return res.render("index", {
            popupMessage: message,
            popupType: "error",
        });
    }
};