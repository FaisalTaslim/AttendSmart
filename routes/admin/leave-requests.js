const express = require('express');
const router = express.Router();
const leaveRequests = require('../../models/userLeave');
const { FinalEmployeeSummary } = require('../../models/overallSummary');
const { MonthlyEmployeeSummary } = require('../../models/monthlySummary');
const Employee = require('../../models/Employee');
const userOnLeave = require('../../models/userOnLeave');
const schoolStudent = require('../../models/SchoolStudent');
const collegeStudent = require('../../models/CollegeStudent');
const moment = require('moment');

router.post('/:uniqueId/accept', async (req, res) => {
    try {
        console.log("📍 Hitting the accept route");

        const leaveDoc = await leaveRequests.findOne({
            uniqueId: req.params.uniqueId,
            status: "pending"
        });

        if (!leaveDoc) {
            return res.status(404).send("❌ Leave request not found or already processed");
        }

        const userId = req.params.uniqueId;
        const monthKey = moment().format("YYYY-MM");

        const operations = [];

        if (leaveDoc.userType === "Employee") {
            const [finalSummary, monthlySummary] = await Promise.all([
                FinalEmployeeSummary.findOne({ employee: userId }),
                MonthlyEmployeeSummary.findOne({ employee: userId, month: monthKey })
            ]);

            if (!finalSummary || !monthlySummary) {
                console.error("⚠️ Missing summary documents for user:", userId);
                return res.status(404).send("Error! Cannot proceed forward. Summaries not found.");
            }

            operations.push(
                MonthlyEmployeeSummary.updateOne(
                    { employee: userId, month: monthKey },
                    { $inc: { leaveDays: 1 } }
                ),
                FinalEmployeeSummary.updateOne(
                    { employee: userId },
                    { $inc: { leaveDays: 1 } }
                ),
                Employee.updateOne(
                    { uniqueId: userId },
                    { $set: { onLeave: true } }
                )

            );
        }

        if (leaveDoc.userType === "SchoolStudent" || leaveDoc.userType === "CollegeStudent") {
            operations.push(
                userOnLeave.create({
                    uniqueId: userId,
                    userName: leaveDoc.userName,
                    userType: leaveDoc.userType,
                    startDate: leaveDoc.startDate,
                    endDate: leaveDoc.endDate
                })
            );
            if (leaveDoc.userType === 'SchoolStudent') {
                operations.push(
                    schoolStudent.findOneAndUpdate(
                        { uniqueId: userId },
                        { $set: { onLeave: true } }
                    )
                )
            }
            else if (leaveDoc.userType === 'CollegeStudent') {
                operations.push(
                    collegeStudent.findOneAndUpdate(
                        { uniqueId: userId },
                        { $set: { onLeave: true } }
                    )
                )
            }
        }

        await Promise.all(operations);

        await leaveRequests.findOneAndUpdate(
            { uniqueId: req.params.uniqueId, status: 'pending' },
            { $set: { status: 'accepted' } }
        );

        console.log(`✅ Leave request for ${leaveDoc.userName} marked as accepted.`);
        res.redirect('/dashboard/admin');

    } catch (err) {
        console.error("❌ Error accepting leave request:", err);
        res.status(500).send("Error accepting request");
    }
});

router.post('/:uniqueId/reject', async (req, res) => {
    try {
        await leaveRequests.findOneAndUpdate(
            { uniqueId: req.params.uniqueId, status: 'pending' },
            { $set: { status: 'rejected' } },
            { new: true }
        );
        res.redirect('/dashboard/admin');
    } catch (err) {
        console.error("❌ Error rejecting leave request:", err);
        res.status(500).send("Error rejecting request");
    }
});

module.exports = router;