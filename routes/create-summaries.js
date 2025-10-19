const express = require('express');
const router = express.Router();
const renewStudentSummary = require('../controllers/renewMonthlyStudentSummary');
const renewEmployeeSummary = require('../controllers/renewMonthlyEmployeeSummary');

router.get('/student', renewStudentSummary.monthlyStudentSummary);
router.get('/employee', renewEmployeeSummary.monthlyEmployeeSummary);

module.exports = router;