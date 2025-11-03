const counter = require('../models/counter');
const bcrypt = require('bcrypt');
const org = require('../models/Org');
const logs = require('../models/logs');
const department = require('../models/departments');
const moment = require('moment');
const { rollbackAdminCounter, rollbackOrg, rollbackDepartment } = require('../utils/rollback-functions');
const sendRegistrationMail = require('../utils/sendEmails');


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
            orgName: orgName.toLowerCase().trim(),
            orgBranch: orgBranch.toLowerCase().trim(),
            address: address.toLowerCase().trim(),
            adminName: adminName.toLowerCase().trim(),
            adminId: adminId.toLowerCase(),
        }

        const existingOrg = await org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });
        if (existingOrg) {
            error_tracker = 1;

            return res.render('register/admin-register', {
                error: "Duplicate Registration attempt. Please login with your existing account!"
            });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        error_tracker = 2;
        const counterDoc = await counter.findOneAndUpdate(
            {},
            { $inc: { newAdminValue: 1 } },
            { new: true }
        );

        newAdminNumber = counterDoc.newAdminValue.toString();

        const newOrg = {
            ...req.body, 
            uniqueId: newAdminNumber,
            orgName: lowerCaseData.orgName,
            orgBranch: lowerCaseData.orgBranch,
            address: lowerCaseData.address,
            expectedEmployees: Number(expectedEmployees),
            expectedStudents: Number(expectedStudents),
            admin: [{
                adminName: lowerCaseData.adminName,
                adminId: lowerCaseData.adminId,
                adminContact,
                adminEmail,
                adminPassword: hashedPassword
            }]
        };


        error_tracker = 3;
        await org.create(newOrg);

        error_tracker = 4;
        await department.create({
            org: newAdminNumber,
            schoolStudentStandard: [],
            collegeDepartments: [],
            employeeDepartments: []
        });

        error_tracker = 5;
        await logs.create({
            org: newAdminNumber,
            registerLogs: [`Organization created at ${moment().format("DD-MM-YYYY HH:mm:ss")}`],
            loginLogs: [],
            supportLogs: [],
            employeeSessionLogs: [],
            studentSessionLog: [],
            studentAttendanceHistory: [],
            employeeAttendanceHistory: []
        });

        try {
            await sendRegistrationMail(adminEmail, adminName, newAdminNumber, 'Admin');
        } catch (mailError) {
            console.error('❌ Failed to send registration email to admin:', mailError.message);
        }

        return res.redirect('/login');

    } catch (err) {
        const error_messages = {
            2: 'Fatal Error: Missing counter. Contact your organization!',
            3: 'Failed to create Organization. Try again!',
            4: 'Failed to create department. Try again!',
            5: 'Failed to create logs. Try again!'
        };

        switch (error_tracker) {
            case 2:
                return res.render('register/admin-register', { error: error_messages[2] });

            case 3:
                await rollbackAdminCounter();
                return res.render('register/admin-register', { error: error_messages[3] });

            case 4:
                await rollbackAdminCounter();
                await rollbackOrg(newAdminNumber);
                return res.render('register/admin-register', { error: error_messages[4] });

            case 5:
                await rollbackAdminCounter();
                await rollbackOrg(newAdminNumber);
                await rollbackDepartment(newAdminNumber);
                return res.render('register/admin-register', { error: error_messages[5] });

            default:
                return res.render('register/admin-register', { error: err.message });
        }
    }
};