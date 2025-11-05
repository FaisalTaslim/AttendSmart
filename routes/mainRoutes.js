const express = require('express');
const path = require('path');
const router = express.Router();

const viewsPath = path.join(__dirname, '../views');

const routes = {
    '/': 'index.html',
    '/login': 'login.html',
    '/qr-view': 'qr.ejs',
};

Object.entries(routes).forEach(([route, file]) => {
    router.get(route, (req, res) => {
        if (file.endsWith('.ejs')) {
            res.render(file.replace('.ejs', ''));
        } else {
            res.sendFile(path.join(viewsPath, file));
        }
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