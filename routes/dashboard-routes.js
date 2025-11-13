const express = require('express');
const router = express.Router();

router.get('/admin', (req, res) => {
    res.render('dashboards/admin');
});

module.exports = router;