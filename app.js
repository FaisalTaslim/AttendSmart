require('dotenv').config();
require('./config/cronLeaveCleanup');
const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const sessionMiddleware = require('./config/sessions');
const setLocals = require('./middleware/locals');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const app = express();
connectDB();

const liveReloadServer = livereload.createServer({ port: 35730 });
liveReloadServer.watch(path.join(__dirname, 'public'));
liveReloadServer.watch(path.join(__dirname, 'views'));
app.use(connectLivereload());

liveReloadServer.server.once("connection", () => {
    setTimeout(() => liveReloadServer.refresh("/"), 100);
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use(sessionMiddleware);
app.use(setLocals);

app.use('/', require('./routes/mainRoutes'));
app.use('/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/org', require('./routes/createOrg'));
app.use('/api', require('./routes/createScStdn'));
app.use('/api', require('./routes/createClgStdn'));
app.use('/api', require('./routes/createEmp'));
app.use('/auth', require('./routes/loginRoutes'));
app.use('/send-notice', require('./routes/admin/notice'));
app.use('/student-session', require('./routes/admin/student-session'));
app.use('/api/support', require('./routes/support'));
app.use('/update-org', require('./routes/admin/update-org'));
app.use('/leave', require('./routes/admin/leave-requests'));
app.use('/update-college-student', require('./routes/college-student/update-student'));
app.use('/request-leave-clgstudent', require('./routes/college-student/post-leave'));
app.use('/request-leave-employees', require('./routes/corporate/post-leave'));
app.use('/update-school-student', require('./routes/school-student/update-school-student'));
app.use('/request-leave-schlstudent', require('./routes/school-student/post-leave'));
app.use('/update-employee', require('./routes/corporate/update-employee'));
app.use('/employee-qr', require('./routes/admin/qr-handler'));
app.use('/mark-employee', require('./routes/corporate/mark-employee'));
app.use('/mark-attendance-students', require('./routes/college-student/mark-attendance'));
app.use('/create-summary', require('./routes/create-summaries'));
app.use('/cleanlogs', require('./routes/clear-logs'));

module.exports = app;