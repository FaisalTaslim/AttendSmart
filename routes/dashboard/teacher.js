const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/dashboards/index');
const teacher = require('../../controllers/dashboards/teacher/index');
const main = require('../../controllers/main/index');
const authorize = require('../../middleware/authorize-access');

router.get('/', authorize('employee'), dashboard.teacher.display);
router.get('/qr/generate-session-key', authorize('employee', 'admin'), main.fetch.sessionKey);
router.post('/start-student-session', authorize('employee', 'admin'), teacher.attendance.startStudentSession);

module.exports = router;