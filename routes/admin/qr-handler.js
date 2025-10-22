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
        const sessionInstigator = req.session.user.name;
        const user = req.session.user.uniqueId;

        let { employeeCode, qrImage } = await generateEmployeeQR(sessionInstigator);

        const entry = { employeeCode, sessionInstigator, attendanceType, shiftType };

        if (!employeeCode || !sessionInstigator || !attendanceType || !shiftType) {
            return res.render('qr', "Unable to process QR. Missing important fields");
        }

        const monthKey = moment().format("YYYY-MM");

        await Promise.all([
            logs.findOneAndUpdate(
                { org: user },
                { $push: { employeeSessionLogs: entry } }
            ),
            FinalEmployeeSummary.updateMany(
                { org: user, shift: shift },
                { $inc: { totalDays: 1 } }
            ),
            MonthlyEmployeeSummary.updateMany(
                { org: user, month: monthKey, shift: shift },
                { $inc: { totalDays: 1 } }
            )
        ]);

        return res.render('qr', { qrImage });

    } catch (err) {
        console.error("Error updating employee summaries:", err);
        res.status(500).send("❌ Server error");
    }
});

module.exports = router;