const express = require("express");
const router = express.Router();
const upload = require("../../utils/file-parsing/multer");
const admin = require("../../controllers/dashboard-features/upload.subjects");

router.post("/admin/subjects/upload", upload.single("subjectsCsv"), admin.uploadSubjects);
router.post("/admin/schedule/upload", upload.single("scheduleCsv"), admin.uploadSchedule)

module.exports = router;