const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(__dirname, '../views');

const routes = {
    '/': 'index.html',
    '/login': 'login.html',
    '/support': 'support.html',
    '/log': 'log.html',
};

Object.entries(routes).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        res.sendFile(path.join(viewsPath, file));
    });
});

router.get('/error-login', (req, res) => {
    res.send('<h2>Password Mismatched!</h2>')
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Error destroying session:", err);
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});


module.exports = router;