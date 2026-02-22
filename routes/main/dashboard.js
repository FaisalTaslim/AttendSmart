const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/main/dashboard/get');
const admin = require('../../controllers/main/dashboard/admin');
const schoolStudent = require('../../controllers/main/dashboard/school-student');
const collegeStudent = require('../../controllers/main/dashboard/college-student');
const employee = require('../../controllers/main/dashboard/employee');
const teacher = require('../../controllers/main/dashboard/teacher');
const captureAttendance = require('../../controllers/main/dashboard/capture-attendance');
const faceAPI = require('../../controllers/face.../detection/face-register');
const ensureLoggedIn = require('../../middleware/authMiddleware')
const adminFeatures = require('../../controllers/dashboard-features/admin/add-users')
const upload = require('../../utils/file-parsing/multer');
const manageUsers = require('../../controllers/dashboard-features/admin/delete-suspend-users')
const session = require('../../controllers/dashboard-features/admin/start-session');
const face1 = require('../../controllers/face.../recognition/employee')

router.get('/', ensureLoggedIn, dashboard.get);
router.get('/admin', ensureLoggedIn, admin.dashboard);
router.get('/school-student', ensureLoggedIn, schoolStudent.dashboard);
router.get('/college-student', ensureLoggedIn, collegeStudent.dashboard);
router.get('/employee/corporate', ensureLoggedIn, employee.dashboard);
router.get('/employee/teacher', ensureLoggedIn, teacher.dashboard);
router.get('/capture-attendance', captureAttendance.dashboard);
router.post('/face-register', ensureLoggedIn, faceAPI.registerFace);


router.post('/admin/upload-students', ensureLoggedIn, upload.single('studentsUsersCsv'), adminFeatures.uploadStudents);
router.post('/admin/users/:type/suspend/:code', ensureLoggedIn, manageUsers.suspend);
router.post('/admin/users/:type/remove/:code', ensureLoggedIn, manageUsers.delete);
router.post('/admin/employee/start-session', ensureLoggedIn, session.employee);


router.get('/employee/face-data', face1.getFaceData);
router.post('/employee/increment-attendance', face1.incrementAttendance);

module.exports = router;
