const express = require('express');
const router = express.Router();
const admin = require('../../controllers/register/admin');
const student = require('../../controllers/register/student');

router.post('/admin', admin.register);
router.post('/student/college', student.register_clg);
router.post('/student/school', student.register_sch);

module.exports = router;