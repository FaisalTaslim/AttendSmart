const express = require('express');
const router = express.Router();
const createSummary = require('../controllers/createMonthlySummary');

router.get('/', createSummary.monthlyStudentSummary);

module.exports = router;