const express = require('express');
const router = express.Router();
const face = require('../controllers/face-api/index.js');

router.post('/register-face', face.registerApi.registerFace);
router.get('/fetch-data', face.fetch.faceData);
router.post('/mark-attendance', face.attendance.markAttendance);

module.exports = router; 
