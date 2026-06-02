const express = require("express");
const router = express.Router();
const admin = require('../../controllers/dashboards/admin/index');

router.get('/check-employee-session', admin.attendance.checkEmployeeSession);
router.get('/start-employee-session', admin.attendance.startEmployeeSession);

module.exports = router;