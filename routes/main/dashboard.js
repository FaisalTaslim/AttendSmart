const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/dashboard/get');
const admin = require('../../controllers/dashboard/admin');
const schoolStudent = require('../../controllers/dashboard/school-student');
const collegeStudent = require('../../controllers/dashboard/college-student');
const employee = require('../../controllers/dashboard/employee');
const ensureLoggedIn = require('../../middleware/authMiddleware')

router.get('/', ensureLoggedIn, dashboard.get);
router.get('/admin', ensureLoggedIn, admin.dashboard);
router.get('/school-student', ensureLoggedIn, schoolStudent.dashboard);
router.get('/college-student', ensureLoggedIn, collegeStudent.dashboard);
router.get('/employee', ensureLoggedIn, employee.dashboard);

module.exports = router;