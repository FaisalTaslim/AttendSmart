const express = require('express');
const router = express.Router();
const admin = require('../../controllers/register/admin');
const student = require('../../controllers/register/student');

router.post('/admin', admin.register);
router.post('/student', student.register_clg);

module.exports = router;