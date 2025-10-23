const express = require('express');
const router = express.Router();
const Employee = require('../../models/Employee');
const LeaveRequest = require('../../models/userLeave');

router.post('/', async (req, res) => {
    try {
        const { uniqueId, startDate, endDate, leaveType, reason } = req.body;

        const employee = await Employee.findOne({ uniqueId });
        console.log(employee);
        if (!employee) {
            return res.status(404).json({ error: "Employee not found" });
        }

        const org = employee.org;

        const leaveRequest = new LeaveRequest({
            org,
            uniqueId,
            userType: req.session.user.role,
            userName: employee.userName,
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
