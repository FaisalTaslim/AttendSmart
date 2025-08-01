require('dotenv').config();
console.log("🔍 Loaded URI:", process.env.MONGODB_URI);

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);

const session = require('express-session');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        httpOnly: true
    }
}));

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.user ? true : false;
    res.locals.loggedUser = req.session.user || null;
    next();
});


const mainRoutes = require('./routes/mainRoutes');
const registerRoutes = require('./routes/registerViews');
const dashboardRoutes = require('./routes/dashboardRoutes');

const orgRoutes = require('./routes/createOrg');
const schoolStudentRoutes = require('./routes/createScStdn');
const collegeStudentRoutes = require('./routes/createClgStdn');
const employeeRoutes = require('./routes/createEmp');
const supportRoute = require('./routes/createSupport');
const loginRoutes = require('./routes/loginRoutes');
const userLeaveRoute = require('./routes/userLeaveRoute');
const { router: qrRoutes } = require('./routes/qrRoutesEmployee');
const qrRoutesTeacher = require('./routes/qrRoutesStudent');

app.use('/', mainRoutes);
app.use('/register', registerRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/org', orgRoutes);
app.use('/api', schoolStudentRoutes); 
app.use('/api', collegeStudentRoutes);
app.use('/api', employeeRoutes);
app.use('/api', supportRoute);
app.use('/auth', loginRoutes);
app.use('/api/request-leave', userLeaveRoute);
app.use('/get-qr-employee', qrRoutes);
app.use('/get-qr-student', qrRoutesTeacher);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
