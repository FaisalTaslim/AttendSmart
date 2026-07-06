const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const index = require('./index');
const authorize = require('../middleware/authorize-access');

router.post('/register-face', authorize('employee', 'school-student', 'college-student'), index.upload.registerFace.request);
router.post('/subjects', authorize('admin'), upload.single('subjectsCsv'), index.upload.subjects.request);
router.post('/schedule', authorize('admin'), upload.single('scheduleCsv'), index.upload.schedule.request);

module.exports = router;