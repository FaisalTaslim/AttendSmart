const express = require('express');
const router = express.Router();
const admin = require('../../controllers/dashboard/admin');
const ensureLoggedIn = require('../../middleware/authMiddleware')

router.get('/admin', ensureLoggedIn, admin.dashboard);

module.exports = router;