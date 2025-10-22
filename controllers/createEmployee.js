const Employee = require('../models/Employee');
const { FinalEmployeeSummary } = require('../models/overallSummary');
const { MonthlyEmployeeSummary } = require('../models/monthlySummary');
const Org = require('../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../models/counter');
const Logs = require('../models/logs');
const Department = require('../models/departments');
const moment = require('moment');

exports.createEmployee = async (req, res) => {
    try {
        const {
            userName,
            employeeId,
            workType,
            designation,
            shift,
            dept,
            contact,
            email,
            password,
            orgName,
            orgBranch,
            termsCheck
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const counterDoc = await Counter.findOne();
        const newEmployeeNumber = (Number(counterDoc.newEmployeeValue) + 1).toString();
        counterDoc.newEmployeeValue = newEmployeeNumber;

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
            shift,
            designation,
            contact,
            email,
            onLeave: false,
            password: hashedPassword,
            termsCheck
        });

        await FinalEmployeeSummary.create({
            org: findOrg.uniqueId,
            employee: newEmployee.uniqueId,
            employeeName: newEmployee.userName,
            emp_dept: dept,
            shift: shift,
            totalDays: 0,
            attendedDays: 0,
            leaveDays: 0,
            percentage: 0,
        });

        const monthKey = moment().format("YYYY-MM");
        await MonthlyEmployeeSummary.create({
            org: findOrg.uniqueId,
            employee: newEmployee.uniqueId,
            employeeName: newEmployee.userName,
            shift: shift,
            emp_dept: dept,
            month: monthKey,
            totalDays: 0,
            attendedDays: 0,
            leaveDays: 0,
            percentage: 0,
        });

        await Department.findOneAndUpdate(
            { org: findOrg.uniqueId },
            { $addToSet: { employeeDepartments: dept } },
            { upsert: true, new: true }
        );

        const logDoc = await Logs.findOne({ org: findOrg.uniqueId });
        if (logDoc) {
            logDoc.registerLogs.push(
                `Employee: ${userName}, Dept: ${dept}, EmployeeID: ${employeeId}, Joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`
            );
            await logDoc.save();
        } else {
            console.log("⚠️ No log document found for this organization.");
        }

        findOrg.registeredEmployees += 1;
        await counterDoc.save();
        await findOrg.save();

        res.redirect('/login');
    } catch (err) {
        console.error("❌ Employee Creation Error:", err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};