const express = require('express');
const router = express.Router();
const cleanLogsController = require('../controllers/clean-logs');

router.get('/', cleanLogsController.cleanLogs);

module.exports = router;
