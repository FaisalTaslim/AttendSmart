const express = require('express');
const router = express.Router();
const { createOrg } = require('../controllers/createOrg');

router.post('/create-org', createOrg);

module.exports = router;
