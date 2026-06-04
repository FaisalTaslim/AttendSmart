const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/dashboards/index');
const teacher = require('../../controllers/dashboards/teacher/index');

router.get('/', dashboard.teacher.display);
router.post('/start-student-session', teacher.attendance.startStudentSession);

module.exports = router;
