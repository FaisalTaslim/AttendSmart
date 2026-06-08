const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/dashboards/index');
const teacher = require('../../controllers/dashboards/teacher/index');
const main = require('../../controllers/main/index');

router.get('/', dashboard.teacher.display);
router.get('/qr/generate-session-key', main.fetch.sessionKey);
router.post('/start-student-session', teacher.attendance.startStudentSession);

module.exports = router;
