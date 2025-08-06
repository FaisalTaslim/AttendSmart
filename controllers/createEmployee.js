const Employee = require('../models/Employee');
const { EmployeeSummary } = require('../models/attendanceSummary');
const Org = require('../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../models/counter');
const Logs = require('../models/logs');
const {attendanceHistoryEmployee} = require('../models/attendanceHistory')

exports.createEmployee = async (req, res) => {
    try {
        const {
            userName,
            employeeId,
            workType,
            designation,
            dept,
            contact,
            email,
            password,
            orgName,
            orgBranch,
            termsCheck,
        } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let counterDoc = await Counter.findOne();
        const newEmployeeNumber = (Number(counterDoc.newEmployeeValue) + 1).toString();
        counterDoc.newEmployeeValue = newEmployeeNumber;
        await counterDoc.save();

        const findOrg = await Org.findOne({
            orgName: { $regex: new RegExp(`^${orgName}$`, 'i') },
            orgBranch: { $regex: new RegExp(`^${orgBranch}$`, 'i') }
        });

        if (!findOrg) {
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        }

        const newEmployee = await Employee.create({
            uniqueId: newEmployeeNumber,
            org: findOrg.uniqueId,
            userName,
            employeeId,
            dept,
            workType,
            designation,
            contact,
            email,
            password: hashedPassword,
            termsCheck
        });

        await EmployeeSummary.create({
            org: findOrg.uniqueId,
            employee: newEmployee.uniqueId,
            totalDays: 0,
            attendedDays: 0,
            percentage: 0,
            monthlySummary: [],
        });

        const logDoc = await Logs.findOne({ org: findOrg.uniqueId });
        if (logDoc) {
            logDoc.registerLogs.push(`Employee ${userName} joined on ${new Date().toLocaleString()}`);
            await logDoc.save();
        } else {
            console.log("⚠️ No log document found for this organization.");
        }

        findOrg.registeredEmployees += 1;
        await findOrg.save();

        res.redirect('/login');

    } catch (err) {
        console.error("❌ Employee Creation Error:", err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
