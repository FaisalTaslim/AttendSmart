const express = require('express');
const router = express.Router();
const Notice = require('../../models/notice');
const Org = require('../../models/Org');
const logs = require('../../models/logs');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const generateCode = require('../../utils/generate-code-for-qr');
const moment = require('moment');

router.post('/', async (req, res) => {
    console.log("Hitting the student session route.");
    try {
        const { subjectName, sessionType } = req.body;
        const user = req.session.user.uniqueId;

        const getOrg = await Org.findOne({ uniqueId: user });
        if (!getOrg) return res.status(404).send("Org not found.");

        const sessionInstigator = getOrg.admin[0]?.adminName || "Unknown";

        const logEntry = {
            studentCode: generateCode(),
            sessionInstigator,
            sessionType,
            subjectName,
            expired: false,
            createdAt: moment().format("DD-MM-YYYY HH:mm:ss")
        };

        if (sessionType === "fresh-session") {
            const monthKey = moment().format("YYYY-MM");

            await FinalStudentSummary.updateMany(
                { subjectName },
                { $inc: { attendedLectures: 1 } }
            );

            await MonthlyStudentSummary.updateMany(
                { subjectName, month: monthKey },
                { $inc: { attendedLectures: 1 } },
                { upsert: true } 
            );
        }

        const updatedLog = await logs.findOneAndUpdate(
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
        }, 20000);

        res.redirect('/dashboard/admin');
    } catch (error) {
        console.error("Error creating student session log:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
