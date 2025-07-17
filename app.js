require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = express();


mongoose.connect('mongodb://localhost:27017/AttendSmart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


const mainRoutes = require('./routes/mainRoutes');
const orgRoutes = require('./routes/orgRoutes');
const schoolStudentRoutes = require('./routes/schoolStudentRoutes');
const registerRoutes = require('./routes/registerRoutes');

app.use('/', mainRoutes);
app.use('/api/org', orgRoutes);
app.use('/api', schoolStudentRoutes); 
app.use('/register', registerRoutes)


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
