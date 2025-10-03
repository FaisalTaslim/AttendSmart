const express = require('express');
const router = express.Router();
const Notice = require('../../models/notice');
const Org = require('../../models/Org');
const logs = require('../../models/logs');
const Employee = require('../../models/Employee');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const generateCode = require('../../utils/generate-code-for-qr');
const moment = require('moment');

router.post('/', async (req, res) => {
    console.log("Hitting the student session route.");
    try {
        const { subjectName, sessionType, departments } = req.body;
        const user = req.session.user.uniqueId;
        let sessionInstigator;

        if (req.session.user.role == "Org") {
            const getOrg = await Org.findOne({ uniqueId: user });
            if (!getOrg) return res.status(404).send("Org not found.");

            sessionInstigator = getOrg.admin[0]?.adminName || "Unknown";
        }
        else {
            sessionInstigator = (await Employee.findOne({ uniqueId: user })).userName;
        }

        // Parse departments string into array
        const departmentArray = departments
            ? departments.split(',').map(d => d.trim()).filter(Boolean)
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
            const monthKey = moment().format("YYYY-MM");

            for (const dept of departmentArray) {
                await FinalStudentSummary.updateMany(
                    { subjectName, std_dept: dept },
                    { $inc: { totalLectures: 1 } }
                );

                await MonthlyStudentSummary.updateMany(
                    { subjectName, std_dept: dept, month: monthKey },
                    { $inc: { totalLectures: 1 } },
                    { upsert: true }
                );
            }
        }

        await logs.findOneAndUpdate(
            { org: user },
            { $push: { studentSessionLog: logEntry } },
            { upsert: true, new: true }
        );

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
