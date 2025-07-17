const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(__dirname, '../views/register');

// Route map for registration HTML pages
const routes = {
    '/': 'admin-register.html',
    '/school': 'school-register.html',
    '/college': 'college-register.html',
    '/employee': 'employee-register.html'
};

Object.entries(routes).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        res.sendFile(path.join(viewsPath, file));
    });
});

module.exports = router;
