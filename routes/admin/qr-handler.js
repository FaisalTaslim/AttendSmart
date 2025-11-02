const express = require('express');
const router = express.Router();
const moment = require('moment');
const { FinalEmployeeSummary } = require('../../models/overallSummary');
const { MonthlyEmployeeSummary } = require('../../models/monthlySummary');
const logs = require('../../models/logs');
const generateEmployeeQR = require('../../utils/generateEmployeeQr');

router.post('/', async (req, res) => {
    try {
        const { attendanceType, shift } = req.body;
        const shiftType = shift.trim();

        console.log("Session user:", req.session.user);

        const sessionInstigator = req.session.user.name;
        const user = req.session.user.uniqueId;

        let { employeeCode, qrImage } = await generateEmployeeQR(sessionInstigator);

        const entry = { employeeCode, sessionInstigator, attendanceType, shiftType };

        if (!employeeCode || !sessionInstigator || !attendanceType || !shiftType) {
            return res.render('qr', "Unable to process QR. Missing important fields");
        }

        const monthKey = moment().format("YYYY-MM");

        await logs.findOneAndUpdate(
            { org: user },
            { $push: { employeeSessionLogs: entry } }
        );

        const summaryDocsFinal = await FinalEmployeeSummary.updateMany(
            { org: user, shift: shiftType },
            { $inc: { totalDays: 1 } },
            { new: true }
        );

        const summaryDocsMonthly = await MonthlyEmployeeSummary.updateMany(
            { org: user, month: monthKey, shift: shiftType },
            { $inc: { totalDays: 1 } },
            { new: true }
        )
        console.log("Final Summaries:\n", JSON.stringify(summaryDocsFinal, null, 2));
        console.log("Monthly Summaries:\n", JSON.stringify(summaryDocsMonthly, null, 2));


        console.log("QR generated Successfully!");
        return res.render('qr', { qrImage });

    } catch (err) {
        console.error("Error updating employee summaries:", err);
        res.status(500).send("❌ Server error");
    }
});

module.exports = router;