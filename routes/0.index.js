module.exports = {
  page: {
    home: require('../controllers/main/homepage'),
    guidebook: require('../controllers/main/guidebook'),
    camerapage: require('../controllers/main/camerapage'),
    scanner: require('../controllers/main/scanner'),
    qrPage: require('../controllers/main/qr-page'),
    redirect: require('../controllers/main/redirect-to-dashboard'),
    admin: require('../controllers/main/admin'),
    employee: require('../controllers/main/employee'),
    collegeStudent: require('../controllers/main/college-student'),
    schoolStudent: require('../controllers/main/school-student'),
    teacher: require('../controllers/main/teacher'),
  },
  registration: {
    admin: require('../controllers/registration/admin'),
    employee: require('../controllers/registration/employee'),
    student: require('../controllers/registration/student'),
  },
  verify: {
    account: require('../controllers/authentication/verify-user'),
    login: require('../controllers/authentication/login'),
    logout: require('../controllers/authentication/logout'),
  },
  upload: {
    subjects: require('../controllers/uploads/upload-subjects'),
    schedule: require('../controllers/uploads/upload-schedule'),
    registerFace: require('../controllers/uploads/register-face'),
  },
  attendance: {
    processQR: require('../controllers/attendance/process-qr'),
    startEmployeeSession: require('../controllers/attendance/start-employee-session'),
    startStudentSession: require('../controllers/attendance/start-student-session'),
    markAttendance: require('../controllers/attendance/mark-attendance'),
  },
  fetch: {
    faceData: require('../controllers/fetch/fetch-face-data'),
    orgData: require('../controllers/fetch/org-data'),
    sessionkey: require('../controllers/fetch/session-key'),
  },
};