const express = require('express');
const router = express.Router();
const markAttendance = require('../../../../controllers/face.../recognition/student/mark-attendance');
const ensureLoggedIn = require('../../../../middleware/authMiddleware')

router.post('/verify-attendance', ensureLoggedIn, markAttendance.markAttendance);

module.exports = router;