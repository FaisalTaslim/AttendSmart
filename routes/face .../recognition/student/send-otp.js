const express = require('express');
const router = express.Router();
const otp = require('../../../../controllers/face.../recognition/student/send-otp')
const ensureLoggedIn = require('../../../../middleware/authMiddleware')

router.post('/send-attendance-otp', ensureLoggedIn, otp.verifyOtp);

module.exports = router;