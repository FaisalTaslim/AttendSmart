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


const mainRoutes = require('./routes/mainRoutes');
const registerRoutes = require('./routes/registerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const orgRoutes = require('./routes/orgRoutes');
const schoolStudentRoutes = require('./routes/schoolStudentRoutes');
const collegeStudentRoutes = require('./routes/collegeStudentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const supportRoute = require('./routes/supportRoute');
const loginRoutes = require('./routes/loginRoutes');

app.use('/', mainRoutes);
app.use('/register', registerRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/org', orgRoutes);
app.use('/api', schoolStudentRoutes); 
app.use('/api', collegeStudentRoutes);
app.use('/api', employeeRoutes);
app.use('/api', supportRoute);
app.use('/auth', loginRoutes)


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
