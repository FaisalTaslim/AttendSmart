const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(__dirname, '../views/register');

const routes = {
    '/': 'admin-register',
    '/school': 'school-register',
    '/college': 'college-register',
    '/employee': 'employee-register'
};

Object.entries(routes).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        res.render(`register/${file}`, {error: ""});
    });
});

module.exports = router;
