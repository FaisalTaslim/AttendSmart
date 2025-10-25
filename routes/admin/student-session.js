const express = require('express');
const router = express.Router();
const Notice = require('../../models/notice');
const Org = require('../../models/Org');
const logs = require('../../models/logs');
const userOnLeave = require('../../models/userOnLeave');
const Employee = require('../../models/Employee');
const collegeStudent = require('../../models/CollegeStudent');
const schoolStudent = require('../../models/SchoolStudent');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const generateCode = require('../../utils/generate-code-for-qr');
const moment = require('moment');

router.post('/', async (req, res) => {
    console.log("Hitting the student session route.");
    try {
        const { subjectName, sessionType, departments } = req.body;
        const user = req.session.user.uniqueId;
        const monthKey = moment().format("YYYY-MM");
        let sessionInstigator;
        let orgType;

        if (req.session.user.role == "Org") {
            const getOrg = await Org.findOne({ uniqueId: user });
            if (!getOrg) return res.status(404).send("Org not found.");

            sessionInstigator = getOrg.admin[0]?.adminName || "Unknown";
            orgType = getOrg.orgType;
        }
        else {
            sessionInstigator = (await Employee.findOne({ uniqueId: user })).userName;
        }

        const departmentArray = departments
            ? departments.split(',').map(d => d.trim().toUpperCase()).filter(Boolean)
            : [];

        console.log("Departments array:", departmentArray);

        const logEntry = {
            studentCode: generateCode(),
            class: departmentArray,
            sessionInstigator,
            sessionType,
            subjectName,
            expired: false,
            createdAt: moment().format("DD-MM-YYYY HH:mm:ss")
        };


        if (sessionType === "fresh-session" && departmentArray.length > 0) {
            for (const dept of departmentArray) {
                await MonthlyStudentSummary.updateMany(
                    { subjectName, std_dept: dept, month: monthKey },
                    { $inc: { totalLectures: 1 } },
                );

                await FinalStudentSummary.updateMany(
                    { subjectName, std_dept: dept },
                    { $inc: { totalLectures: 1 } }
                );
            }
        }

        await logs.findOneAndUpdate(
            { org: user },
            { $push: { studentSessionLog: logEntry } },
            { upsert: true, new: true }
        );

        if (orgType == "college") {
            const onLeaveCollege = await collegeStudent.find({
                onLeave: true,
                std_dept: { $in: departmentArray }
            });

            for (const element of onLeaveCollege) {
                const getId = element.uniqueId;
                const isVerifiedLeave = await userOnLeave.findOne({ uniqueId: getId });

                if (isVerifiedLeave) {
                    await MonthlyStudentSummary.findOneAndUpdate({
                        student: getId,
                        std_dept: { $in: departmentArray },
                        month: monthKey
                    },
                        { $inc: { leaveDays: 1 } }
                    )

                    await FinalStudentSummary.findOneAndUpdate({
                        student: getId,
                        std_dept: { $in: departmentArray },
                    },
                        { $inc: { leaveDays: 1 } }
                    )
                }
            }
        }
        else if (orgType == "school") {
            const onLeaveSchool = await schoolStudent.find({
                onLeave: true,
                std_dept: { $in: departmentArray }
            });

            for (const element of onLeaveSchool) {
                const getId = element.uniqueId;
                const isVerifiedLeave = await userOnLeave.findOne({ uniqueId: getId });

                if (isVerifiedLeave) {
                    await MonthlyStudentSummary.findOneAndUpdate({
                        student: getId,
                        std_dept: { $in: departmentArray },
                        month: monthKey
                    },
                        { $inc: { leaveDays: 1 } }
                    )

                    await FinalStudentSummary.findOneAndUpdate({
                        student: getId,
                        std_dept: { $in: departmentArray },
                    },
                        { $inc: { leaveDays: 1 } }
                    )
                }
            }
        }

        setTimeout(async () => {
            await logs.updateOne(
                { org: user, "studentSessionLog.studentCode": logEntry.studentCode },
                { $set: { "studentSessionLog.$.expired": true } }
            );
            console.log(`⏱️ Code ${logEntry.studentCode} expired.`);
        }, 600000);

        if (req.session.user.role == "Employee")
            res.redirect("/dashboard/teachingStaff");
        else
            res.redirect("/dashboard/admin");

    } catch (error) {
        console.error("Error creating student session log:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;