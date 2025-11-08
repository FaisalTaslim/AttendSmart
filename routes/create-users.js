const express = require('express');
const router = express.Router();
const user = require('../controllers/create-users');

router.post('/college-student', user.createCollegeStudent);
router.post('/school-student', user.createSchoolStudent);
router.post('/employee', user.createEmployee);
router.post('/org', user.createOrg);

module.exports = router;