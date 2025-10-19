// scripts/monthlyEmployeeSummary.js
const mongoose = require("mongoose");
const moment = require("moment");
const Employee = require("../models/Employee");
const { FinalEmployeeSummary } = require("../models/overallSummary");

const MONGO_URI = "mongodb://localhost:27017/AttendSmart";

(async () => {
    try {
        console.log("🔌 Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB connected");

        const employees = await Employee.find();
        console.log(`📋 Found ${employees.length} employees`);

        for (const emp of employees) {
            // If you have an "org" field to fetch, replace accordingly
            await FinalEmployeeSummary.create({
                org: emp.org || "ORG001", // Replace with actual org ref or logic
                employee: emp.uniqueId,
                employeeName: emp.userName,
                emp_dept: emp.dept,
                shift: emp.shift,
                totalDays: 0,
                attendedDays: 0,
                leaveDays: 0,
                percentage: 0,
                createdAt: moment().toDate()
            });
            console.log(`✅ Summary created for: ${emp.userName}`);
        }

        console.log("🎉 Monthly summaries created successfully!");
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await mongoose.disconnect();
        console.log("🔒 MongoDB connection closed");
    }
})();
