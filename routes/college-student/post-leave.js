const express = require('express');
const router = express.Router();
const CollegeStudent = require('../../models/CollegeStudent');
const LeaveRequest = require('../../models/userLeave');

router.post('/', async (req, res) => {
    try {
        const { uniqueId, startDate, endDate, leaveType, reason } = req.body;

        const student = await CollegeStudent.findOne({ uniqueId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const org = student.org;

        const leaveRequest = new LeaveRequest({
            org,
            uniqueId,
            userType: req.session.user.role,
            userName: student.userName,
            startDate,
            endDate,
            leaveType,
            reason,
            status: "pending" 
        });

        const savedRequest = await leaveRequest.save();

        res.json({
            message: "✅ Leave request submitted successfully",
            leaveRequest: savedRequest
        });

    } catch (err) {
        console.error("Error submitting leave request:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
