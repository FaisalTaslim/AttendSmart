const express = require('express');
const path = require('path');
const router = express.Router();
const ensureLoggedIn = require('../../middleware/authMiddleware');
const corporateDashboard = require('../controllers/corpDb');
const schoolDashboard = require('../controllers/schoolDb')
const collegeDashboard = require('../controllers/collegeDb')
const teacherDashboard = require('../controllers/teachingStaff');
const adminDashboard = require('../controllers/adminDb');

const viewsPath = path.join(__dirname, '../views/view-dashboards');

router.get("/", ensureLoggedIn, (req, res) => {
    res.render('view-dashboards/dashboard-home');
});

router.use('/corporateUser', ensureLoggedIn, corporateDashboard);
router.use('/schoolUser', ensureLoggedIn, schoolDashboard);
router.use('/collegeUser', ensureLoggedIn, collegeDashboard);
router.use('/teachingStaff', ensureLoggedIn, teacherDashboard);
router.use('/admin', ensureLoggedIn, adminDashboard);

module.exports = router;