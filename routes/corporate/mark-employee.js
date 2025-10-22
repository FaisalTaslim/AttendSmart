const express = require("express");
const router = express.Router();
const moment = require("moment");
const Employee = require("../../models/Employee");
const Logs = require("../../models/logs");
const { FinalEmployeeSummary } = require("../../models/overallSummary");
const { MonthlyEmployeeSummary } = require("../../models/monthlySummary");

router.post("/", async (req, res) => {
    try {
        console.log("📍 Hitting the mark-employee route.");

        const { employeeCode, sessionInstigator } = req.body;
        const employeeId = req.session?.user?.uniqueId;
        const employeeName = req.session?.user?.name;
        const monthKey = moment().format("YYYY-MM");

        if (!employeeCode || !sessionInstigator || !employeeId) {
            return res.status(400).send("❌ Missing essential data in request.");
        }

        const emp = await Employee.findOne({ uniqueId: employeeId });
        if (!emp) return res.status(404).send("❌ Employee not found.");

        const { org: orgId, shift: employeeShift, dept } = emp;

        const logDoc = await Logs.findOne({ org: orgId });
        if (!logDoc) return res.status(404).send("❌ No logs found for this organization.");

        const matchedLog = logDoc.employeeSessionLogs.find(
            (log) =>
                log.employeeCode === employeeCode &&
                log.sessionInstigator === sessionInstigator &&
                log.shiftType === employeeShift
        );

        if (!matchedLog) {
            return res.status(400).send("⚠️ Invalid QR scan or shift mismatch.");
        }

        const attendanceType = matchedLog.attendanceType;
        console.log(`➡️ Detected ${attendanceType.toUpperCase()} attempt.`);

        if (attendanceType === "check-in") {
            const checkInTime = moment().format("DD-MM-YYYY HH:mm:ss");
            const historyEntry = {
                employeeId,
                employeeName,
                dept: dept || "Unknown Dept",
                checkIn: checkInTime,
                checkOut: "",
                status: "Present",
            };

            await Promise.all([
                MonthlyEmployeeSummary.findOneAndUpdate(
                    { org: orgId, employee: employeeId, month: monthKey },
                    { $inc: { attendedDays: 1 } },
                    { upsert: true, new: true }
                ),
                FinalEmployeeSummary.findOneAndUpdate(
                    { org: orgId, employee: employeeId },
                    { $inc: { attendedDays: 1 } },
                    { upsert: true, new: true }
                ),
                Logs.findOneAndUpdate(
                    { org: orgId },
                    { $push: { employeeAttendanceHistory: historyEntry } },
                    { upsert: true, new: true }
                )
            ]);

            console.log(`✅ ${employeeName} checked in at ${checkInTime}`);
            return res.send("✅ Check-in recorded successfully. Do not refresh the page.");
        }

        else if (attendanceType === "check-out") {
            const checkOutTime = moment().format("DD-MM-YYYY HH:mm:ss");
            const pendingEntries = (logDoc.employeeAttendanceHistory || [])
                .filter(
                    (entry) =>
                        entry.employeeId === employeeId &&
                        (!entry.checkOut || entry.checkOut.trim() === "")
                )
                .sort(
                    (a, b) =>
                        (b._id?.getTimestamp?.() ?? 0) - (a._id?.getTimestamp?.() ?? 0)
                );

            const lastPending = pendingEntries[0];
            if (!lastPending)
                return res.send("⚠️ No active check-in found. Unable to check out.");

            await Logs.updateOne(
                { "employeeAttendanceHistory._id": lastPending._id },
                { $set: { "employeeAttendanceHistory.$.checkOut": checkOutTime } }
            );

            console.log(`🕒 ${employeeName} checked out at ${checkOutTime}`);
            return res.send("✅ Check-out recorded successfully. You may leave now.");
        }

        else {
            return res.status(400).send("⚠️ Invalid attendance type in QR data.");
        }

    } catch (err) {
        console.error("❌ Error handling QR scan:", err);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
});

module.exports = router;