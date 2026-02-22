require('dotenv').config();
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

/* <------------- Register Routes ----------> */
app.use('/registration', require('./routes/register/registration'));
app.use('/', require('./routes/register/verify-user'));

/* <------------- Uploading Routes ----------> */
app.use('/upload', require('./routes/register/upload-csv'));

/* <------------- MainRoutes ----------> */
app.use('/', require('./routes/main/main'));
app.use('/dashboard', require('./routes/main/dashboard'));
app.use("/public/org", require("./routes/main/main"));

/* <------------- Logout Routes ----------> */
app.use("/auth", require("./routes/auth/login"));
app.use('/', require('./routes/auth/logout'));

module.exports = app;
