const Counter = require('../models/counter');
const bcrypt = require('bcrypt');
const Org = require('../models/Org');
const Logs = require('../models/logs');
const Department = require('../models/departments');
const moment = require('moment');

exports.createOrg = async (req, res) => {
    let error_tracker = 0;
    let newAdminNumber = 0;
    try {
        const { adminName, adminId, adminContact, adminEmail, adminPassword } = req.body.admin[0];
        const { orgName, branch, expectedTeachers, expectedStudents } = req.body;

        const existingOrg = await Org.findOne({ orgName, branch });
        if (existingOrg) {
            error_tracker = 1;

            return res.render('register/admin-register', {
                error: "Duplicate Registration attempt. Please login with your old account!"
            });
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const counterDoc = await Counter.findOneAndUpdate({}, { $inc: { newAdminValue: 1 } }, { new: true });
        if (!counterDoc) {
            error_tracker = 2;
            return res.render('register/admin-register', { error: "Fatal Error: Missing counter! Contact developers! Click the 'back' button" });
        }

        newAdminNumber = counterDoc.newAdminValue.toString();

        const newOrg = {
            uniqueId: newAdminNumber,
            expectedTeachers: Number(expectedTeachers),
            expectedStudents: Number(expectedStudents),
            ...req.body,
            admin: [{
                adminName,
                adminId,
                adminContact,
                adminEmail,
                adminPassword: hashedPassword
            }]
        };

        const orgData = await Org.create(newOrg);

        if (!orgData) {
            error_tracker = 3;
            throw new Error("Failed to create Organization. Rolling back! Click the 'back' button, and try again!");
        }

        const departmentDoc = await Department.create({
            org: newAdminNumber,
            schoolStudentStandard: [],
            collegeDepartments: [],
            employeeDepartments: []
        });

        if (!departmentDoc) {
            error_tracker = 4;
            throw new Error("Failed to create department. Rolling back! Click the 'back' button, and try again!");
        }

        const logData = await Logs.create({
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
            throw new Error("Failed to create logs. Rolling back! Click the 'back' button, and try again!");
        }

        return res.redirect('/login');

    } catch (err) {
        async function rollbackCounter() {
            await Counter.updateOne(
                {},
                { $inc: { newAdminValue: -1 } }
            )
        }
        const rollbackOrg = async () => { await Org.deleteOne({ uniqueId: newAdminNumber }); }
        const rollbackDepartment = async () => { await Department.deleteOne({ org: newAdminNumber }); }

        if (error_tracker == 3) rollbackCounter();
        else if (error_tracker == 4) {
            rollbackCounter();
            rollbackOrg();
        }
        else if (error_tracker == 5) {
            rollbackCounter();
            rollbackOrg();
            rollbackDepartment();
        }
        
        return res.render('register/admin-register', { error: err.message });
    }
};