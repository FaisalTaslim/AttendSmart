const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/createEmployee');

router.post('/register-employee', employeeController.createEmployee);

module.exports = router;