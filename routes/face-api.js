const express = require('express');
const router = express.Router();
const face = require('../controllers/face-api/index.js');

router.post('/register-face', face.registerApi.registerFace);

module.exports = router;