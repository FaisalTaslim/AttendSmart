const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const Notice = require('../models/notice');
const LeaveRequest = require('../models/userLeave');

router.get('/', async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await Employee.findOne({ uniqueId: user });

        if (!findUser) return res.status(404).send("User not found");
        const { org, uniqueId, employeeId, userName, dept, designation, contact, email } = findUser;

        const allNotices = await Notice.find({ uniqueId: org });
        const notices = allNotices.filter(notice => {
            if (!notice.userIdType && !notice.userIdValue) return true;
            if (notice.userIdType === "uniqueUserId" && notice.userIdValue === uniqueId) return true;
            if (notice.userIdType === "rollNo" && notice.userIdValue === roll) return true;
            return false;
        });

        const leaveRequests = await LeaveRequest.find({ uniqueId: uniqueId }).sort({ createdAt: -1 });

        res.render('view-dashboards/teachingStaff', {
            uniqueId,
            employeeId,
            userName,
            dept,
            designation,
            contact,
            email,
            notices: notices || [],
            leaveRequests: leaveRequests || []
        });

    } catch (error) {
        console.error("Error loading employee dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
