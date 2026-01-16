const express = require('express');
const router = express.Router();

const routes = {
    '/': 'index',
};

Object.entries(routes).forEach(([route, view]) => {
    router.get(route, (req, res) => {
        res.render(view, {
            popupMessage: null,
            popupType: null
        });
    });
});

module.exports = router;