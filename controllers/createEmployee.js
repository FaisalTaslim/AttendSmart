const Employee = require('../models/Employee');
const { EmployeeSummary } = require('../models/attendanceSummary');
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

        const monthKey = moment().format("YYYY-MM");

        await EmployeeSummary.create({
            org: findOrg.uniqueId,
            employee: newEmployee.uniqueId,
            emp_dept: dept,
            totalDays: 0,
            attendedDays: 0,
            percentage: 0,
            monthlySummary: {
                [monthKey]: {
                    totalDays: 0,
                    attendedDays: 0,
                    percentage: 0
                }
            }
        });
        
        await Department.findOneAndUpdate(
            { org: findOrg.uniqueId },
            { $addToSet: { employeeDepartments: dept } },
            { upsert: true, new: true }
        );

        const logDoc = await Logs.findOne({ org: findOrg.uniqueId });
        if (logDoc) {
            logDoc.registerLogs.push(
                `Employee: ${userName}, Dept: ${dept}, EmployeeID: ${employeeId}, joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`
            );
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
