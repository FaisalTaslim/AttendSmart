require('dotenv').config();
console.log("🔍 Loaded URI:", process.env.MONGODB_URI);

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
const app = express();

mongoose.connect('mongodb://localhost:27017/AttendSmart');
mongoose.connect(process.env.MONGODB_URI)

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const mainRoutes = require('./routes/mainRoutes');
const registerRoutes = require('./routes/registerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const orgRoutes = require('./routes/orgRoutes');
const schoolStudentRoutes = require('./routes/schoolStudentRoutes');
const collegeStudentRoutes = require('./routes/collegeStudentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

app.use('/', mainRoutes);
app.use('/register', registerRoutes);
app.use('/dashboard', dashboardRoutes);

app.use('/api/org', orgRoutes);
app.use('/api', schoolStudentRoutes); 
app.use('/api', collegeStudentRoutes);
app.use('/api', employeeRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
