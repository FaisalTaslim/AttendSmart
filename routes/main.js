const express = require('express');
const router = express.Router();
const main = require('../controllers/main/index');
const dashboard = require('../controllers/dashboards/index');

router.get('/', main.display.homepage);
router.get('/guidebook', main.display.guidebook);
router.get("/list", main.fetch.orgList);
router.get('/dashboard', main.dashboard.redirect);
router.get('/dashboard/admin', dashboard.admin.display);
router.get('/dashboard/school-student', dashboard.schoolStudent.display);
router.get('/dashboard/college-student', dashboard.collegeStudent.display);
router.get('/dashboard/employee', dashboard.employee.display);
router.get('/dashboard/teacher', dashboard.teacher.display);

module.exports = router;