const employee = require('../models/Employee');
const { FinalEmployeeSummary } = require('../models/overallSummary');
const { MonthlyEmployeeSummary } = require('../models/monthlySummary');
const Org = require('../models/Org');
const bcrypt = require('bcrypt');
const counter = require('../models/counter');
const logs = require('../models/logs');
const department = require('../models/departments');
const moment = require('moment');
const {
    rollbackEmployeeCounter,
    rollbackEmployeeSummary,
    rollbackEmployee,
    rollbackRegisterLog
} = require('../utils/rollback-functions');

exports.createEmployee = async (req, res) => {
    let error_tracker = 0;
    let findOrgId;
    let newEmployeeNumber;
    let currentLogMessage;
    let orgType;

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

        const lowerCaseData = {
            userName: userName.toLowerCase().trim(),
            employeeId: employeeId.toLowerCase().trim(),
            designation: designation.toLowerCase().trim(),
            dept: dept.toLowerCase().trim(),
            orgName: orgName.toLowerCase().trim(),
            orgBranch: orgBranch.toLowerCase().trim(),
            email: email.toLowerCase().trim()
        };

        error_tracker = 1;
        const findOrg = await Org.findOne({
            orgName: lowerCaseData.orgName,
            orgBranch: lowerCaseData.orgBranch
        });

        if (!findOrg) {
            return res.render('register/employee-register', {
                error: 'No organization found! Try again!'
            });
        }

        findOrgId = findOrg.uniqueId;
        orgType = findOrg.orgType;

        const findExisting = await employee.findOne({
            org: findOrgId,
            userName: lowerCaseData.userName,
            employeeId: lowerCaseData.employeeId,
            dept: lowerCaseData.dept
        });

        if (findExisting) {
            return res.render('register/employee-register', {
                error: 'Duplicate Account Creation Attempt! Please log in with your existing account!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        error_tracker = 2;
        const counterDoc = await counter.findOneAndUpdate(
            {},
            { $inc: { newEmployeeValue: 1 } },
            { new: true }
        );

        if (!counterDoc) {
            throw new Error('Missing employee counter document!');
        }

        newEmployeeNumber = counterDoc.newEmployeeValue;

        error_tracker = 3;
        await employee.create({
            uniqueId: newEmployeeNumber,
            org: findOrgId,
            userName: lowerCaseData.userName,
            employeeId: lowerCaseData.employeeId,
            dept: lowerCaseData.dept,
            workType,
            shift,
            designation: lowerCaseData.designation,
            contact,
            email,
            onLeave: false,
            password: hashedPassword,
            termsCheck
        });

        error_tracker = 4;
        await FinalEmployeeSummary.create({
            org: findOrgId,
            employee: newEmployeeNumber,
            employeeName: lowerCaseData.userName,
            emp_dept: lowerCaseData.dept,
            shift,
            totalDays: 0,
            attendedDays: 0,
            leaveDays: 0,
            percentage: 0
        });

        error_tracker = 5;
        const monthKey = moment().format('YYYY-MM');
        await MonthlyEmployeeSummary.create({
            org: findOrgId,
            employee: newEmployeeNumber,
            employeeName: lowerCaseData.userName,
            shift,
            emp_dept: lowerCaseData.dept,
            month: monthKey,
            totalDays: 0,
            attendedDays: 0,
            leaveDays: 0,
            percentage: 0
        });

        error_tracker = 6;
        await department.findOneAndUpdate(
            { org: findOrgId },
            { $addToSet: { employeeDepartments: lowerCaseData.dept } },
            { upsert: true, new: true }
        );

        error_tracker = 7;
        currentLogMessage = `Employee: ${userName}, Dept: ${dept}, EmployeeID: ${employeeId}, Joined on ${moment().format('DD-MM-YYYY HH:mm:ss')}`;
        await logs.findOneAndUpdate(
            { org: findOrgId },
            { $push: { registerLogs: currentLogMessage } }
        );

        error_tracker = 8;
        await Org.findOneAndUpdate(
            { uniqueId: findOrgId },
            { $inc: { registeredEmployees: 1 } }
        );

        try {
            await sendRegistrationMail(lowerCaseData.email, userName, newEmployeeNumber, 'Employee');

        } catch (mailError) {
            console.error('❌ Failed to send registration email:', mailError.message);
        }

        return res.redirect('/login');
    } catch (err) {
        console.error('Error during employee registration:', err);

        const error_messages = {
            2: 'Fatal Error: Missing counter document. Contact your organization!',
            3: "Couldn't create employee account! Try again!",
            4: "Couldn't create final summary! Please try again!",
            5: "Couldn't create monthly summary! Please try again!",
            6: 'Failed to create department entry. Try again!',
            7: 'Failed to create log entry. Contact your organization!',
            8: 'Failed to update organization record. Contact admin!'
        };

        switch (error_tracker) {
            case 2:
            case 3:
                await rollbackEmployeeCounter();
                break;

            case 4:
                await rollbackEmployeeCounter();
                await rollbackEmployee(findOrgId, newEmployeeNumber);
                break;

            case 5:
                await rollbackEmployeeCounter();
                await rollbackEmployee(findOrgId, newEmployeeNumber, orgType);
                await rollbackEmployeeSummary(findOrgId, newEmployeeNumber, 'final');
                break;

            case 6:
            case 7:
                await rollbackEmployeeCounter();
                await rollbackEmployee(findOrgId, newEmployeeNumber, orgType);
                await rollbackEmployeeSummary(findOrgId, newEmployeeNumber, 'final');
                await rollbackEmployeeSummary(findOrgId, newEmployeeNumber, 'monthly');
                break;

            case 8:
                await rollbackEmployeeCounter();
                await rollbackEmployee(findOrgId, newEmployeeNumber, orgType);
                await rollbackEmployeeSummary(findOrgId, newEmployeeNumber, 'final');
                await rollbackEmployeeSummary(findOrgId, newEmployeeNumber, 'monthly');
                await rollbackRegisterLog(findOrgId, currentLogMessage, "System couldn't update organization employee count!");
                break;

            default:
                console.error('Unhandled error:', err.message);
                break;
        }

        return res.render('register/employee-register', {
            error: error_messages[error_tracker] || err.message
        });
    }
};