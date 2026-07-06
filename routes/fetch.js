const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const index = require('./0.index');
const authorize = require('../middleware/authorize-access');

router.get('/face-data', authorize('employee', 'school-student', 'college-student', 'admin'), index.fetch.faceData.request);
router.get('/org-data', index.fetch.orgData.request);
router.get('/generate-session-key', authorize('employee', 'admin'), index.fetch.sessionkey.request);

module.exports = router;