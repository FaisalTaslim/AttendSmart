const express = require('express');
const router = express.Router();
const Employee = require('../../models/Employee');
const { MonthlyEmployeeSummary } = require("../../models/monthlySummary");
const { FinalEmployeeSummary } = require("../../models/overallSummary");

router.post("/", async (req, res) => {
    try {
        const {
            uniqueId,
            userName,
            roll,
            dept,
            shift,
            designation,
            contact,
            email,
        } = req.body;

        const updatedEmployee = await Employee.findOneAndUpdate(
            { uniqueId },
            { userName, roll, dept, shift, designation, contact, email },
            { new: true }
        );

        if (!updatedEmployee) return res.status(404).send("❌ Employee not found");

        await MonthlyEmployeeSummary.findOneAndUpdate(
            { employee: uniqueId },
            { $set: { shift: shift } }
        );

        await FinalEmployeeSummary.findOneAndUpdate(
            { employee: uniqueId },
            { $set: { shift: shift } }
        );

        res.json({
            message: "✅ Employee updated successfully",
            employee: updatedEmployee
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;