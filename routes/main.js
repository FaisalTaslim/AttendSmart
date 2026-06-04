const express = require('express');
const router = express.Router();
const main = require('../controllers/main/index');
const dashboard = require('../controllers/dashboards/index');

router.get('/', main.display.homepage);
router.get('/guidebook', main.display.guidebook);
router.get("/list", main.fetch.orgList);
router.get('/scanner', main.display.scanner);
router.get('/dashboard', main.dashboard.redirect);

router.get('/dashboard/employee/corporate', dashboard.employee.display);

module.exports = router;