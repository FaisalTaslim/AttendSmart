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
        const sessionInstigator = req.session.user.name;
        const user = req.session.user.uniqueId;
        let { employeeCode, qrImage } = await generateEmployeeQR(sessionInstigator);

        const entry = { employeeCode, sessionInstigator, attendanceType, shiftType: shift.trim() };

        await logs.findOneAndUpdate(
            { org: user },
            { $push: { employeeSessionLogs: entry } }
        );

        await FinalEmployeeSummary.updateMany(
            { org: user, shift: shift },
            { $inc: { totalDays: 1 } }
        );

        const monthKey = moment().format("YYYY-MM");
        await MonthlyEmployeeSummary.updateMany(
            { org: user, month: monthKey, shift: shift },
            { $inc: { totalDays: 1 } }
        );

        res.render('qr', { qrImage });
    } catch (err) {
        console.error("Error updating employee summaries:", err);
        res.status(500).send("❌ Server error");
    }
});

module.exports = router;