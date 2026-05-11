const express = require("express");
const router = express.Router();
const upload = require("../utils/file-parsing/multer");
const register = require('../controllers/registration/index');

router.post("/admin", register.admin.adm);
router.post("/student/college", register.student.register_clg);
router.post("/student/school", register.student.register_sch);
router.post("/employee", register.employee.register_emp);
router.get("/verify/:token/:role/:code/:secondary_role", register.verifyUser.verify);
router.post("/admin/subjects/upload", upload.single("subjectsCsv"), register.uploadCsv.uploadSubjects);
router.post("/admin/schedule/upload", upload.single("scheduleCsv"), register.uploadCsv.uploadSchedule);

module.exports = router;