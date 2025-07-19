const express = require('express');
const path = require('path');
const router = express.Router();

const ensureLoggedIn = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const viewsPath = path.join(__dirname, '../views/view-dashboards');


router.get("/", ensureLoggedIn, (req, res) => {
    res.sendFile(path.join(__dirname, "../views/view-dashboards/dashboard-home.html"));
});

router.get('/school', ensureLoggedIn, checkRole(['CollegeStudent']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'student.html'));
});

router.get('/school', ensureLoggedIn, checkRole(['SchoolStudent']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'student.html'));
});

router.get('/employee-c', ensureLoggedIn, checkRole(['Employee']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'employee-c.html'));
});

router.get('/employee-e', ensureLoggedIn, checkRole(['Employee']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'employee-e.html'));
});

router.get('/org', ensureLoggedIn, checkRole(['Org']), (req, res) => {
    res.sendFile(path.join(viewsPath, 'admin.html'));
});

module.exports = router;
