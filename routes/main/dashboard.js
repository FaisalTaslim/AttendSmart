const express = require('express');
const router = express.Router();
const dashboard = require('../../controllers/dashboard/get');
const admin = require('../../controllers/dashboard/admin');
const ensureLoggedIn = require('../../middleware/authMiddleware')

router.get('/', ensureLoggedIn, dashboard.get);
router.get('/admin', ensureLoggedIn, admin.dashboard);

module.exports = router;