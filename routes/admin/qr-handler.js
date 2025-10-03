const express = require('express');
const router = express.Router();
const { FinalEmployeeSummary } = require('../../models/overallSummary');
const { MonthlyEmployeeSummary } = require('../../models/monthlySummary');

router.post('/', async (req, res) => {
    try {
        console.log("Hitting the QR Handler route");
        await FinalEmployeeSummary.updateMany({}, { $inc: { totalDays: 1 } });
        await MonthlyEmployeeSummary.updateMany({}, { $inc: { totalDays: 1 } });

        console.log("✅ Total days incremented for all employees in both overall and monthly summaries");
        res.redirect('/dashboard/admin');
    } catch (err) {
        console.error("Error updating employee summaries:", err);
        res.status(500).send("❌ Server error");
    }
});

module.exports = router;