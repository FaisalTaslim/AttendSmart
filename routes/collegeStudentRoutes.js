const express = require('express');
const router = express.Router();
const collegeStudentController = require('../controllers/studentController/college');

router.post('/register-college-student', collegeStudentController.createCollegeStudent);

module.exports = router;
