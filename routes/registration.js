const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const index = require('./index');
const authorize = require('../middleware/authorize-access');

router.post('/admin', index.registration.admin.request);
router.post('/student', index.registration.student.request);
router.post('/employee', index.registration.employee.request);

module.exports = router;