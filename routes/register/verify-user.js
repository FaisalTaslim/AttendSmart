const express = require('express');
const router = express.Router();
const email = require('../../controllers/register/verify-user');

router.get("/verify/:token/:role/:code/:secondary_role", email.verify);

module.exports = router;