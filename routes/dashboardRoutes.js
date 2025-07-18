const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(__dirname, '../views/view-dashboards');

const routes = {
    '/': 'dashboard-home.html',
    '/school': 'student.html',
    '/employee-c': 'employee-c.html',
    '/employee-e': 'employee-e.html'
};

Object.entries(routes).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        res.sendFile(path.join(viewsPath, file));
    });
});

module.exports = router;
