const express = require('express');
const router = express.Router();
const studentFace = require('../../../../controllers/face.../recognition/student/fetch-face-data');
const ensureLoggedIn = require('../../../../middleware/authMiddleware')

router.get('/face-data', ensureLoggedIn, studentFace.getFace);

module.exports = router;