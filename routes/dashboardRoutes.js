const express = require('express');
const path = require('path');
const router = express.Router();
const ensureLoggedIn = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const userDashboard = require('../controllers/corporateDashboard');

const viewsPath = path.join(__dirname, '../views/view-dashboards');

router.get("/", ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(viewsPath, 'dashboard-home.html'));
});

router.use('/corporateUser', ensureLoggedIn, userDashboard);

router.get('/org', ensureLoggedIn, checkRole(['Org']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'admin.html'));
});

module.exports = router;
