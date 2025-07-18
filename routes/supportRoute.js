const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.post('/support', supportController.createSupportDB);


module.exports = router;