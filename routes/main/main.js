const express = require('express');
const router = express.Router();
const controller = require('../../controllers/main/main');

router.get('/', controller.homepage);
router.get('/guidebook', controller.guidebook);
router.get("/list", controller.orgList);

module.exports = router;