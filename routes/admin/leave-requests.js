const express = require('express');
const router = express.Router();
const leaveRequests = require('../../models/userLeave');
const { FinalEmployeeSummary } = require('../../models/overallSummary');
const { MonthlyEmployeeSummary } = require('../../models/monthlySummary');
const moment = require('moment');

router.post('/:uniqueId/accept', async (req, res) => {
    try {
        console.log("hitting the accept route")
        const leaveDoc = await leaveRequests.findOneAndUpdate(
            { uniqueId: req.params.uniqueId, status: "pending" },
            { status: 'accepted' },
            { new: true }
        );

        if (!leaveDoc) {
            return res.status(404).send("Leave request not found");
        }

        const userId = req.params.uniqueId;
        const monthKey = moment().format("YYYY-MM");

        if (leaveDoc.userType === "Employee") {
            const [finalSummary, monthlySummary] = await Promise.all([
                FinalEmployeeSummary.findOne({ employee: userId }),
                MonthlyEmployeeSummary.findOne({ employee: userId, month: monthKey })
            ]);

            if (!finalSummary || !monthlySummary) {
                console.error("Missing summary documents for user:", userId);
                return res.status(404).send("Error! Cannot proceed forward. Summaries not found.");
            }

            await Promise.all([
                FinalEmployeeSummary.updateOne(
                    { employee: userId },
                    { $inc: { leaveDays: 1 } }
                ),
                MonthlyEmployeeSummary.updateOne(
                    { employee: userId, month: monthKey },
                    { $inc: { leaveDays: 1 } }
                )
            ]);
        }
        res.redirect('/dashboard/admin');
    } catch (err) {
        console.error("Error accepting leave request:", err);
        res.status(500).send("Error accepting request");
    }
});

router.post('/:uniqueId/reject', async (req, res) => {
    try {
        await leaveRequests.findOneAndUpdate(
            { uniqueId: req.params.uniqueId },
            { status: 'rejected' },
            { new: true }
        );
        res.redirect('/dashboard/admin');
    } catch (err) {
        console.error("Error rejecting leave request:", err);
        res.status(500).send("Error rejecting request");
    }
});

module.exports = router;