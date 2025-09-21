const express = require('express');
const router = express.Router();
const employee = require('../../models/Employee');
const logs = require('../../models/logs');
const { FinalEmployeeSummary } = require("../../models/overallSummary");
const { MonthlyEmployeeSummary } = require("../../models/monthlySummary");
const moment = require('moment');

router.post('/', async (req, res) => {
    try {
        console.log("Hitting the mark-employee route.");

        const qrData = req.body;
        const employeeId = req.session.user.uniqueId;
        const { employeeCode, sessionInstigator } = qrData;
        const monthKey = moment().format("YYYY-MM");

        const getOrg = (await employee.findOne({ uniqueId: employeeId }))?.org;
        const getEmployeeSessionLogs = (await logs.findOne({ org: getOrg }))?.employeeSessionLogs;

        for (const logEntry of getEmployeeSessionLogs) {
            const fetchedEmployeeCode = logEntry.employeeCode;
            const fetchedSessionInstigator = logEntry.sessionInstigator;

            if (fetchedEmployeeCode == employeeCode && fetchedSessionInstigator == sessionInstigator) {
                const historyEntry = {
                    employee: req.session.user.name,
                    employeeId: employeeId,
                    employeeName: req.session.user.name,
                    dept:  (await employee.findOne({ uniqueId: employeeId }))?.dept || "Unknown Dept",
                    checkIn: moment().format("DD-MM-YYYY HH:mm:ss"),
                    checkOut: moment().format("DD-MM-YYYY HH:mm:ss"),
                    status: "Present"
                };

                await logs.findOneAndUpdate(
                    { org: getOrg },
                    { $push: { employeeAttendanceHistory: historyEntry } },
                    { upsert: true, new: true }
                );

                await MonthlyEmployeeSummary.findOneAndUpdate(
                    { org: getOrg, employee: employeeId, month: monthKey },
                    { $inc: { attendedDays: 1 } }
                );

                await FinalEmployeeSummary.findOneAndUpdate(
                    { org: getOrg, employee: employeeId },
                    { $inc: { attendedDays: 1 } }
                );
            }
        }

        res.json({ message: "QR data received successfully!" });

    } catch (err) {
        console.error("Error handling QR scan:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
