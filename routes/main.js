const express = require('express');
const router = express.Router();
const index = require('./0.index');
const authorize = require('../middleware/authorize-access');

router.get('/', index.page.home.display);
router.get('/guidebook', authorize('admin', 'college-student', 'school-student', 'employee'), index.page.guidebook.display);
router.get('/scanner', authorize('school-student', 'college-student'), index.page.scanner.display);
router.get('/capture-attendance', authorize('admin', 'college-student', 'school-student'), index.page.camerapage.display);
router.get('/dashboard', authorize('admin', 'college-student', 'school-student', 'employee'), index.page.redirect.display);
router.get('/admin', authorize('admin'), index.page.admin.display);
router.get('/employee/corporate', authorize('employee'), index.page.employee.display);
router.get('/employee/teacher', authorize('employee'), index.page.teacher.display);
router.get('/college-student', authorize('college-student'), index.page.collegeStudent.display);
router.get('/school-student', authorize('school-student'), index.page.schoolStudent.display);


module.exports = router;