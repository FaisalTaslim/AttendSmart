const express = require('express');
const router = express.Router();
const SchoolStudent = require('../models/SchoolStudent');
const Notice = require('../models/notice');
const LeaveRequest = require('../models/userLeave');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', checkRole(['SchoolStudent']), async (req, res) => {
    try {
        const userUniqueId = req.session.user.uniqueId;
        const student = await SchoolStudent.findOne({ uniqueId: userUniqueId });

        if (!student) return res.status(404).send("User Not Found!");
        const { org, uniqueId, roll } = student;

        const allNotices = await Notice.find({ uniqueId: org });
        const notices = allNotices.filter(notice => {
            if (!notice.userIdType && !notice.userIdValue) return true;
            if (notice.userIdType === "uniqueUserId" && notice.userIdValue === uniqueId) return true;
            if (notice.userIdType === "rollNo" && notice.userIdValue === roll) return true;
            return false;
        });

        const leaveRequests = await LeaveRequest.find({ uniqueId: uniqueId }).sort({ createdAt: -1 });

        res.render('view-dashboards/schoolUser', {
            uniqueId: student.uniqueId,
            userName: student.userName,
            roll: student.roll,
            standard: student.standard,
            contact: student.contact,
            email: student.email,
            subjects: student.subjects || [],
            notices: notices || [],
            leaveRequests: leaveRequests || []
        })
    }
    catch (error) {
        console.error("Error loading student dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
})

module.exports = router;