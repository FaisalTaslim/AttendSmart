const bcrypt = require("bcrypt");
const Org = require("../../models/organization");
const collegeStudent = require("../../models/college-student");
const summary = require("../../models/student-summary");
const log = require("../../models/logs");
const generateCode = require("../../utils/codes");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../../utils/send-emails");
const verifyEmail = require("../../utils/verify-domains");
const moment = require("moment");

async function createUserWithUniqueCode(studentData) {
    while (true) {
        try {
            const code = generateCode(6, "numeric");
            const student = new collegeStudent({ ...studentData, code });
            await student.save();
            return student;
        } catch (err) {
            if (err.code === 11000) continue;
            throw err;
        }
    }
}

exports.register_clg = async (req, res) => {
    console.log("Running the college-student registration module");
    let createdStudent = null;
    let tracker = 0;

    const verificationToken = crypto.randomBytes(20).toString("hex");
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 24);

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

        if (!faceDescriptor) {
            return res.status(400).json({
                message: "Face data missing"
            });
        }

        const parsedDescriptor = faceDescriptor;

        if (!Array.isArray(parsedDescriptor) || parsedDescriptor.length !== 128) {
            return res.status(400).json({
                message: "Invalid face descriptor"
            });
        }

        const isExisting = await collegeStudent.findOne({
            email,
            isDeleted: false
        });

        if (isExisting) {
            return res.render("index", {
                popupMessage: "Account already exists!",
                popupType: "error",
            });
        }

        if (password !== confirmPassword) {
            return res.render("index", {
                popupMessage: "Password mismatch!",
                popupType: "error",
            });
        }

        if (!verifyEmail(email.toLowerCase())) {
            return res.render("index", {
                popupMessage: "Please use your organization email address",
                popupType: "error",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const getOrg = await Org.findOne({
            org: orgName.toLowerCase(),
            branch: orgBranch.toLowerCase()
        });

        createdStudent = await createUserWithUniqueCode({
            org: getOrg.code,
            name,
            roll,
            dept,
            contact,
            email,
            subjects,
            faceData: {
                descriptors: [parsedDescriptor]
            },
            verification: {
                status: "pending",
                token: verificationToken,
                expiresAt: tokenExpiry
            },
            password: hashedPassword,
            termsCheck: "accepted"
        });

        const subjectArray = Array.isArray(subjects) ? subjects : [subjects];
        const filteredSubjects = subjectArray
            .filter(s => s && s.trim() !== "")
            .map(s => s.toLowerCase());

        tracker = 1;
        for (const subject of filteredSubjects) {
            await summary.create({
                org: getOrg.code,
                personType: "student",
                code: createdStudent.code,
                name: createdStudent.name,
                department: createdStudent.dept,
                subjectName: subject,
                month: moment().format("YYYY-MM"),
            });
        }

        tracker = 2;
        await log.findOneAndUpdate(
            { org: getOrg.code },
            {
                $push: {
                    registerLogs: `Student: ${createdStudent.name}, roll: ${createdStudent.roll} of department: ${createdStudent.dept} registered.`
                }
            }
        );

        await Org.findOneAndUpdate(
            { code: getOrg.code },
            { $addToSet: { "departments.college": dept.toLowerCase() } }
        );

        await sendVerificationEmail(
            email,
            verificationToken,
            createdStudent.code,
            "Student",
            "collegeStudent"
        );

        return res.render("index", {
            popupMessage: "Check your email!",
            popupType: "info",
        });

    } catch (err) {
        console.error(err);

        if (tracker >= 1) {
            await collegeStudent.findOneAndDelete({ email });
        }

        res.status(500).json({ message: "Server error" });
    }
};