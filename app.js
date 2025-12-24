require('dotenv').config();
require('./config/cronLeaveCleanup');
const express = require('express');
const path = require('path');
const connectDB = require('./config/database');
const sessionMiddleware = require('./config/sessions');
const setLocals = require('./middleware/locals');
const app = express();
connectDB();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', true);
app.use(sessionMiddleware);
app.use(setLocals);

/* <----------------------- Register Routes --------------------> */
app.use('/registration', require('./routes/register/registration'));
app.use('/', require('./routes/register/verify-email'));



app.use('/', require('./routes/main'));

module.exports = app;