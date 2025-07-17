const express = require('express');
const router = express.Router();
const schoolStudentController = require('../controllers/studentController/school');

router.post('/register-school-student', schoolStudentController.createSchoolStudent);

module.exports = router;
