const express = require('express');
const router = express.Router();
const main = require('../controllers/main/index');
const dashboard = require('../controllers/dashboards/index');
const authorize = require('../middleware/authorize-access');

router.get('/', (req, res) => {
  res.redirect('/app');
});

router.get('/app', main.display.homepage);
router.get('/guidebook', authorize('admin', 'college-student', 'school-student', 'employee'), main.display.guidebook);
router.get("/list", main.fetch.orgList);
router.get('/scanner', authorize('school-student', 'college-student'), main.display.scanner);
router.get('/dashboard', authorize('admin', 'college-student', 'school-student', 'employee'), main.dashboard.redirect);

router.get('/dashboard/employee/corporate', authorize('employee'), dashboard.employee.display);

module.exports = router;