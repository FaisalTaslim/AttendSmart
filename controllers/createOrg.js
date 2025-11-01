const counter = require('../models/counter');
const bcrypt = require('bcrypt');
const org = require('../models/Org');
const logs = require('../models/logs');
const department = require('../models/departments');
const moment = require('moment');
const { rollbackAdminCounter, rollbackOrg, rollbackDepartment } = require('../utils/rollback-functions');

exports.createOrg = async (req, res) => {
    let error_tracker = 0;
    let newAdminNumber = 0;
    try {
        const {
            adminName,
            adminId,
            adminContact,
            adminEmail,
            adminPassword
        } = req.body.admin[0];

        const {
            orgName,
            orgBranch,
            address,
            expectedEmployees,
            expectedStudents,
        } = req.body;

        const lowerCaseData = {
            orgName: orgName.toLowerCase(),
            orgBranch: orgBranch.toLowerCase(),
            address: address.toLowerCase(),
            adminName: adminName.toLowerCase(),
        }

        const existingOrg = await org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });
        if (existingOrg) {
            error_tracker = 1;

            return res.render('register/admin-register', {
                error: "Duplicate Registration attempt. Please login with your existing account!"
            });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const counterDoc = await counter.findOneAndUpdate(
            {},
            { $inc: { newAdminValue: 1 } },
            { new: true }
        );

        if (!counterDoc) {
            error_tracker = 2;
            return res.render('register/admin-register', { error: 'Fatal Error: Missing counter! Contact developers!' });
        }

        newAdminNumber = counterDoc.newAdminValue.toString();

        const newOrg = {
            uniqueId: newAdminNumber,
            orgName: lowerCaseData.orgName,
            orgBranch: lowerCaseData.orgBranch,
            expectedEmployees: Number(expectedEmployees),
            expectedStudents: Number(expectedStudents),
            ...req.body,
            admin: [{
                adminName: lowerCaseData.adminName,
                adminId,
                adminContact,
                adminEmail,
                adminPassword: hashedPassword
            }]
        };

        const orgData = await org.create(newOrg);

        if (!orgData) {
            error_tracker = 3;
            return res.render('register/admin-register', { error: 'Failed to create Organization. Try again!' });
        }

        const departmentDoc = await department.create({
            org: newAdminNumber,
            schoolStudentStandard: [],
            collegeDepartments: [],
            employeeDepartments: []
        });

        if (!departmentDoc) {
            error_tracker = 4;
            return res.render('register/admin-register', { error: 'Failed to create department. Try again!' });
        }

        const logData = await logs.create({
            org: newAdminNumber,
            registerLogs: [`Organization created at ${moment().format("DD-MM-YYYY HH:mm:ss")}`],
            loginLogs: [],
            supportLogs: [],
            employeeSessionLogs: [],
            studentSessionLog: [],
            studentAttendanceHistory: [],
            employeeAttendanceHistory: []
        });

        if (!logData) {
            error_tracker = 5;
            return res.render('register/admin-register', { error: 'Failed to create logs. Try again!' });
        }

        return res.redirect('/login');

    } catch (err) {
        if (error_tracker == 3) await rollbackAdminCounter();
        else if (error_tracker == 4) {
            await rollbackAdminCounter();
            await rollbackOrg(newAdminNumber);
        }
        else if (error_tracker == 5) {
            await rollbackAdminCounter();
            await rollbackOrg(newAdminNumber);
            await rollbackDepartment(newAdminNumber);
        }

        return res.render('register/admin-register', { error: err.message });
    }
};