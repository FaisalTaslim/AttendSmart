const express = require("express");
const router = express.Router();
const upload = require("../../utils/registration/multer");
const admin = require("../../controllers/register/admin");
const student = require("../../controllers/register/student");

router.post(
    "/admin",
    upload.single("excel-1"),
    admin.register
);

router.post("/student/college", student.register_clg);
router.post("/student/school", student.register_sch);

module.exports = router;