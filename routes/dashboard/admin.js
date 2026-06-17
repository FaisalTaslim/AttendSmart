const express = require("express");
const router = express.Router();
const main = require('../../controllers/main/index');
const admin = require('../../controllers/dashboards/admin/index');
const dashboard = require('../../controllers/dashboards/index');
const authorize = require('../../middleware/authorize-access');

router.get('/', authorize('admin'), dashboard.admin.display);
router.get('/capture-attendance', authorize('admin', 'employee', 'college-student', 'school-student'), main.display.captureAttendanceWindow);
router.post('/start-employee-session', authorize('admin'), admin.attendance.startEmployeeSession);

module.exports = router;