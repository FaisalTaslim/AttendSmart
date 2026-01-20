const express = require("express");
const router = express.Router();
const upload = require("../../utils/multer");
const admin = require("../../controllers/files/upload-csv");

router.post(
    "/admin/subjects/upload",
    upload.single("subjectsCsv"),
    admin.uploadSubjects
);

module.exports = router;