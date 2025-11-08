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
app.use('/register', require('./routes/create-users'));
app.use('/auth', require('./routes/loginRoutes'));
app.use('/api/support', require('./routes/support'));

module.exports = app;