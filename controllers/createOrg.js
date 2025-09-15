const Counter = require('../models/counter');
const bcrypt = require('bcrypt');
const Org = require('../models/Org');
const Logs = require('../models/logs');
const Department = require('../models/departments');
const moment = require('moment');

exports.createOrg = async (req, res) => {
    try {
        const {
            adminName,
            adminId,
            adminContact,
            adminEmail,
            adminPassword
        } = req.body.admin[0];

        const existingOrg = await Org.findOne({
            orgName: req.body.orgName,
            branch: req.body.branch
        });

        if (existingOrg) {
            console.log(`⚠️ Duplicate org registration attempt: ${req.body.orgName} - ${req.body.branch}`);
            return res.send(`<h2>❌ Error: Organization with name "${req.body.orgName}" and branch "${req.body.branch}" already exists!</h2>`);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        let counterDoc = await Counter.findOne();
        const newAdminNumber = (Number(counterDoc.newAdminValue) + 1).toString();
        counterDoc.newAdminValue = newAdminNumber;
        await counterDoc.save();

        if (isNaN(req.body.expectedEmployees) && isNaN(req.body.expectedStudents)) {
            return res.send(`<h2>❌ Error: Number of Employees and Students must be digits</h2>`);
        }

        const newOrg = {
            uniqueId: newAdminNumber,
            expectedTeachers: Number(req.body.expectedTeachers),
            expectedStudents: Number(req.body.expectedStudents),
            ...req.body,
            admin: [
                {
                    adminName,
                    adminId,
                    adminContact,
                    adminEmail,
                    adminPassword: hashedPassword,
                }
            ]
        };

        const orgData = await Org.create(newOrg);
        console.log(`✅ Organization ${orgData.orgName} registered successfully`);

        const departmentDoc = await Department.create({
            org: newAdminNumber,
            schoolStudentStandard: [],
            collegeDepartments: [],
            employeeDepartments: []
        });
        console.log(`📁 Department schema initialized for orgId: ${departmentDoc.org}`);

        const newLog = {
            org: newAdminNumber,
            registerLogs: [`Organization created at ${moment().format("DD-MM-YYYY HH:mm:ss")}`],
            loginLogs: [],
            supportLogs: [],
            employeeSessionLogs: [],
            studentSessionLog: [],
            studentAttendanceHistory: [],
            employeeAttendanceHistory: []
        };

        const logData = await Logs.create(newLog);
        console.log(`📝 Log created successfully for orgId: ${logData.org}`);

        return res.redirect('/login');

    } catch (err) {
        console.error("❌ Error while creating org:", err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
