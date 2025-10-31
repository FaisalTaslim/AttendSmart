const express = require('express');
const router = express.Router();
const manageAttendance = require('../../controllers/manage-attendance');

router.post('/edit-attendance', manageAttendance.edit);

module.exports = router;