const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/dashboard/get');
const admin = require('../../controllers/dashboard/admin');
const schoolStudent = require('../../controllers/dashboard/school-student');
const collegeStudent = require('../../controllers/dashboard/college-student');
const employee = require('../../controllers/dashboard/employee');
const teacher = require('../../controllers/dashboard/teacher');
const faceAPI = require('../../controllers/files/face-register');
const ensureLoggedIn = require('../../middleware/authMiddleware')

router.get('/', ensureLoggedIn, dashboard.get);
router.get('/admin', ensureLoggedIn, admin.dashboard);
router.get('/school-student', ensureLoggedIn, schoolStudent.dashboard);
router.get('/college-student', ensureLoggedIn, collegeStudent.dashboard);
router.get('/employee/corporate', ensureLoggedIn, employee.dashboard);
router.get('/employee/teacher', ensureLoggedIn, teacher.dashboard);
router.post('/face-register', ensureLoggedIn, faceAPI.registerFace);

module.exports = router;