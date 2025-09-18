const express = require('express');
const router = express.Router();
const Employee = require('../../models/Employee');

router.post("/", async (req, res) => {
    try {
        const {
            uniqueId,
            userName,
            roll,
            dept,
            designation,
            contact,
            email,
        } = req.body;

        const updatedEmployee = await Employee.findOneAndUpdate(
            { uniqueId },
            { userName, roll, dept, designation, contact, email},
            { new: true }
        );

        if (!updatedEmployee) return res.status(404).send("❌ Employee not found");

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