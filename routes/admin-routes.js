const express = require('express');
const router = express.Router();
const { fetchDetails } = require('../controllers/admin-dashboard/fetch-details');

router.post('/fetch-details', fetchDetails);

module.exports = router;