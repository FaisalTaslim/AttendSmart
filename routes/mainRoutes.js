const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(__dirname, '../views');

// Route map for static HTML pages
const routes = {
    '/': 'index.html',
    '/login': 'login.html',
    '/register': 'register.html',
    '/support': 'support.html',
    '/log': 'log.html',
    '/dashboard/student': 'Dashboard/student.html',
    '/dashboard/employee': 'Dashboard/employee.html'
};

// Loop through the routes and define them dynamically
Object.entries(routes).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        res.sendFile(path.join(viewsPath, file));
    });
});

module.exports = router;