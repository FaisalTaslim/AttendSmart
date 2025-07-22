const express = require('express');
const router = express.Router();
const userLeave = require('../controllers/userLeave');

router.post('/', userLeave.createLeave);

module.exports = router;