const express = require('express');
const router = express.Router();
const email = require('../../controllers/register/verify-email');

router.get("/verify/:token/:role/:code", email.verify);

module.exports = router;