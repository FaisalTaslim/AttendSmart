const express = require('express');
const router = express.Router(); 
const database = require('../controllers/temp');

router.get('/', database.updateDatabase);

module.exports = router;