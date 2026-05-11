require('dotenv').config();
const express = require('express');
const path = require('path');
const sessionMiddleware = require('./config/sessions');
const setLocals = require('./middleware/locals');
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use(sessionMiddleware);
app.use(setLocals);

const mainPages = require('./routes/main');
const register = require('./routes/registration');
const authentication = require('./routes/auth');

app.use('/register', register);
app.use("/auth", authentication);
app.use('/', mainPages);

app.use('/student', require('./routes/face .../recognition/student/send-otp'));
app.use('/student', require('./routes/face .../recognition/student/mark-attendance'));
app.use('/student', require('./routes/face .../recognition/student/fetch-face-data'));

module.exports = app;
