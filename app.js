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
const uploads = require('./routes/uploads');
const authentication = require('./routes/auth');
const attendance = require('./routes/attendance');
const fetch = require('./routes/fetch');

app.get('/', async (req, res) => {res.redirect('/app')});
app.use('/app', mainPages);
app.use('/register', register);
app.use('/uploads', uploads);
app.use('/auth', authentication);
app.use('/attendance', attendance);
app.use('/fetch', fetch);

module.exports = app;