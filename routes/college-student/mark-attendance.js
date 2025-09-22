const express = require('express');
const router = express.Router();
const logs = require('../../models/logs');
const CollegeStudent = require('../../models/CollegeStudent');
const SchoolStudent = require('../../models/SchoolStudent');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const moment = require('moment');

router.post('/', async (req, res) => {
    try {
        const { uniqueId, class: studentClass, code, subject } = req.body;
        console.log("Incoming body:", { uniqueId, studentClass, code, subject });
        const role = req.session.user.role;
        let getOrg;

        if(role == "CollegeStudent") {
            getOrg = (await CollegeStudent.findOne({ uniqueId: req.session.user.uniqueId }))?.org;
        }
        else {
            getOrg = (await SchoolStudent.findOne({ uniqueId: req.session.user.uniqueId }))?.org;
        }
        
        if (!getOrg) return res.status(404).json({ error: "Organization not found for user." });

        async function getLatestSession() {
            const latest = await logs.findOne(
                { org: getOrg, "studentSessionLog.studentCode": code.toUpperCase() },
                { "studentSessionLog.$": 1 }
            );
            return latest?.studentSessionLog?.[0] || null;
        }

        const filterSession = await getLatestSession();
        console.log("Filtered session:", filterSession);

        if (!filterSession) {
            return res.status(404).json({ message: "Session not found or expired." });
        }

        if (filterSession.expired === false) {
            const monthKey = moment().format("YYYY-MM");
            const subjectRegex = new RegExp(`^${subject}$`, "i");

            await MonthlyStudentSummary.findOneAndUpdate(
                { org: getOrg, student: req.session.user.uniqueId, month: monthKey, subjectName: subjectRegex },
                { $inc: { attendedLectures: 1 } }
            );

            await FinalStudentSummary.findOneAndUpdate(
                { org: getOrg, student: req.session.user.uniqueId, subjectName: subjectRegex },
                { $inc: { attendedLectures: 1 } }
            );

            const logEntry = {
                studentId: req.session.user.uniqueId,
                studentName: req.session.user.name,
                dept: studentClass,
                subjectName: subject,
                date: moment().format("DD-MM-YYYY HH:mm:ss"),
                status: "Present",
                reason: ""
            };

            await logs.findOneAndUpdate(
                { org: getOrg },
                { $push: { studentAttendanceHistory: logEntry } }
            );

        } else {
            const logEntry = {
                studentId: req.session.user.uniqueId,
                studentName: req.session.user.name,
                dept: studentClass,
                subjectName: subject,
                date: moment().format("DD-MM-YYYY HH:mm:ss"),
                status: "Absent",
                reason: "Session expired before submission. Attendance skipped!"
            };

            await logs.findOneAndUpdate(
                { org: getOrg },
                { $push: { studentAttendanceHistory: logEntry } }
            );
        }

        res.status(200).json({ message: "Route processed successfully!", session: filterSession });

    } catch (err) {
        console.error("Error in POST / route:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
