const express = require("express");
const router = express.Router();
const index = require("./index");
const authorize = require("../middleware/authorize-access");

router.post(
  "/mark-attendance",
  authorize("employee", "school-student", "college-student", "admin"),
  index.attendance.markAttendance.request,
);

router.post('/start-employee-session', authorize('admin'), index.attendance.startEmployeeSession.request);
router.post('/process-qr', authorize('school-student', 'college-student'), index.attendance.processQR.request);
router.post('/start-student-session', authorize('employee', 'admin'), index.attendance.startStudentSession.request);
router.post('/mark-attendance', authorize('admin', 'employee', 'school-student', 'college-student'), index.attendance.markAttendance.request);

module.exports = router;
