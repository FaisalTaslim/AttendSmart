const express = require('express');
const router = express.Router();
const main = require('../../controllers/main/index');
const dashboard = require('../../controllers/dashboards/index');
const common = require('../../controllers/dashboards/common/index');
const authorize = require('../../middleware/authorize-access');

router.get('/school-student', authorize('school-student'), dashboard.schoolStudent.display);
router.get('/college-student', authorize('college-student'), dashboard.collegeStudent.display);
router.post('/process-qr', authorize('school-student', 'college-student'), common.student.processQr);


module.exports = router;