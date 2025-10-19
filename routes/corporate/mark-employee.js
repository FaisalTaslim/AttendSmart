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

        const { employeeCode, sessionInstigator } = req.body;
        const employeeId = req.session.user.uniqueId;
        const monthKey = moment().format("YYYY-MM");

        const emp = await employee.findOne({ uniqueId: employeeId });
        if (!emp) return res.status(404).json({ error: "Employee not found." });

        const { org: getOrg, shift: employeeShift, dept } = emp;
        const logDoc = await logs.findOne({ org: getOrg });
        if (!logDoc) return res.status(404).json({ error: "Logs not found for this org." });

        const getEmployeeSessionLogs = logDoc.employeeSessionLogs || [];

        for (const logEntry of getEmployeeSessionLogs) {
            const { employeeCode: fetchedEmployeeCode, sessionInstigator: fetchedSessionInstigator, shiftType: fetchedShift, attendanceType: fetchAttendanceType } = logEntry;

            if (fetchedEmployeeCode === employeeCode && fetchedSessionInstigator === sessionInstigator && fetchedShift === employeeShift) {

                if (fetchAttendanceType === "check-in") {
                    const historyEntry = {
                        employeeId,
                        employeeName: req.session.user.name,
                        dept: dept || "Unknown Dept",
                        checkIn: moment().format("DD-MM-YYYY HH:mm:ss"),
                        checkOut: "",
                        status: "Present"
                    };

                    await logs.findOneAndUpdate(
                        { org: getOrg },
                        { $push: { employeeAttendanceHistory: historyEntry } },
                        { upsert: true, new: true }
                    );

                } else if (fetchAttendanceType === "check-out") {
                    const pendingEntries = (logDoc.employeeAttendanceHistory || [])
                        .filter(h => h.employeeId === employeeId && (!h.checkOut || h.checkOut.trim() === ""))
                        .sort((a, b) => b._id.getTimestamp() - a._id.getTimestamp());

                    const lastPending = pendingEntries[0];

                    if (lastPending) {
                        await logs.updateOne(
                            { "employeeAttendanceHistory._id": lastPending._id },
                            { $set: { "employeeAttendanceHistory.$.checkOut": moment().format("DD-MM-YYYY HH:mm:ss") } }
                        );
                    }
                }
                await MonthlyEmployeeSummary.findOneAndUpdate(
                    { org: getOrg, employee: employeeId, month: monthKey },
                    { $inc: { attendedDays: 1 } },
                    { upsert: true }
                );

                await FinalEmployeeSummary.findOneAndUpdate(
                    { org: getOrg, employee: employeeId },
                    { $inc: { attendedDays: 1 } },
                    { upsert: true }
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