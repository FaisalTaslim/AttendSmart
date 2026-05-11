const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authentication/index.js");

router.post("/login", authentication.in.login);
router.get("/logout", authentication.out.logout);

module.exports = router;