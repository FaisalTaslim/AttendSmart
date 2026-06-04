const express = require('express');
const router = express.Router();
const main = require('../../controllers/main/index');
const dashboard = require('../../controllers/dashboards/index');
const common = require('../../controllers/dashboards/common/index');

router.get('/school-student', dashboard.schoolStudent.display);
router.get('/college-student', dashboard.collegeStudent.display);
router.post('/process-qr', common.student.processQr);


module.exports = router;