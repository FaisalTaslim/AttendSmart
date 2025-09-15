const express = require('express');
const router = express.Router();
const CollegeStudent = require('../../models/CollegeStudent');

router.post("/", async (req, res) => {
    try {
        const {
            uniqueId,
            userName,
            roll,
            dept,
            contact,
            email,
            subject1, subject2, subject3, subject4, subject5,
            subject6, subject7, subject8, subject9, subject10,
            subject11, subject12
        } = req.body;

        const subjects = [
            subject1, subject2, subject3, subject4, subject5,
            subject6, subject7, subject8, subject9, subject10,
            subject11, subject12
        ].filter(sub => sub && sub.trim() !== "");

        const updatedStudent = await CollegeStudent.findOneAndUpdate(
            { uniqueId },
            { userName, roll, dept, contact, email, subjects },
            { new: true }
        );

        if (!updatedStudent) return res.status(404).send("❌ Student not found");

        res.json({
            message: "✅ Student updated successfully",
            student: updatedStudent
        });

    } catch (err) {
        console.error("Update error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;