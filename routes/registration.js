const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const index = require('./index');
const authorize = require('../middleware/authorize-access');

router.post('/admin', index.registration.admin.request);
router.post('/student', index.registration.student.request);
router.post('/employee', index.registration.employee.request);
router.get('/verify', index.verify.account.reqeuest);
router.post('/subjects/upload', authorize('admin'), upload.single('subjectsCsv'), index.upload.csv.uploadSubjects);
router.post('/schedule/upload', authorize('admin'), upload.single('scheduleCsv'), index.upload.csv.uploadSchedule);
router.get('/get-org-list', index.fetch.orgList.request);

module.exports = router;