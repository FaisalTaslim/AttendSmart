const express = require("express");
const router = express.Router();
const index = require('./0.index.js');

router.get('/verify', index.verify.account.request);
router.post("/login", index.verify.login.request);
router.post("/logout", index.verify.logout.request);

module.exports = router;