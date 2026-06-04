const express = require("express");
const router = express.Router();
const main = require('../../controllers/main/index');
const admin = require('../../controllers/dashboards/admin/index');
const dashboard = require('../../controllers/dashboards/index');

router.get('/', dashboard.admin.display);
router.get('/capture-attendance', main.display.captureAttendanceWindow);
router.get('/check-employee-session', admin.attendance.checkEmployeeSession);
router.get('/start-employee-session', admin.attendance.startEmployeeSession);

module.exports = router;