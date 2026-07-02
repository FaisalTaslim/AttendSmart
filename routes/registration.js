const express = require("express");
const router = express.Router();
const upload = require("../utils/file-parsing/multer");
const register = require('../controllers/registration/index');
const authorize = require('../middleware/authorize-access');

router.post("/admin", register.admin.adm);
router.post("/admin/subjects/upload", authorize('admin'), upload.single("subjectsCsv"), register.uploadCsv.uploadSubjects);
router.post("/admin/schedule/upload", authorize('admin'), upload.single("scheduleCsv"), register.uploadCsv.uploadSchedule);

router.post("/student/college", register.student.register_clg);
router.post("/student/school", register.student.register_sch);

router.post("/employee", register.employee.register_emp);

router.get("/verify/:token/:role/:code/:secondary_role", register.verifyUser.verify);
router.get("/get-org-list", register.orgList.fetch);

module.exports = router;