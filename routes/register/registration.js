const express = require('express');
const router = express.Router();
const register = require('../../controllers/register/admin')

router.post('/admin', register.admin);

module.exports = router;