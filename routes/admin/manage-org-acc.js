/* For new admin dashboard */
const express = require('express');
const router = express.Router();
const account = require('../../controllers/admin/manage-acc');

router.get('/fetch-details', account.fetchDetails);
module.exports = router;