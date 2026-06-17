const express = require('express');
const router = express.Router();
const face = require('../controllers/face-api/index.js');
const authorize = require('../middleware/authorize-access');

router.post('/register-face', authorize('employee', 'school-student', 'college-student'), face.registerApi.registerFace);
router.get('/fetch-data', authorize('employee', 'school-student', 'college-student'), face.fetch.faceData);
router.post('/mark-attendance', authorize('employee', 'school-student', 'college-student'),face.attendance.markAttendance);

module.exports = router; 