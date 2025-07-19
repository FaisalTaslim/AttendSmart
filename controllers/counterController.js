const mongoose = require('mongoose');
const Counter = require('../models/counter');

mongoose.connect('mongodb://localhost:27017/AttendSmart')
    .then(async () => {
        console.log("✅ Connected to Database...");

        const newCounter = new Counter({
            originalCountValue: "#1",
            newStudentValue: "#0",
            newEmployeeValue: "#0",
        });

        await newCounter.save();
        console.log("✅ Counter created successfully!");
        process.exit();
    })
    .catch(err => {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    });
