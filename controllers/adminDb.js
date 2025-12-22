const express = require('express');
const router = express.Router();
const Org = require('../models/organization.js');
const Employee = require('../models/Employee');
const CollegeStudent = require('../models/CollegeStudent');
const SchoolStudent = require('../models/SchoolStudent');
const { MonthlyEmployeeSummary } = require("../models/monthlySummary");
const { FinalEmployeeSummary } = require('../models/overallSummary');
const { MonthlyStudentSummary } = require("../models/monthlySummary");
const { FinalStudentSummary } = require('../models/overallSummary');
const logs = require('../models/logs');
const Notice = require('../models/notice');
const leaveRequests = require('../models/userLeave');
const generateEmployeeQR = require('../utils/generateEmployeeQr.js');

router.get('/', async (req, res) => {
    try {
        const user = req.session.user.uniqueId;
        const findUser = await Org.findOne({ uniqueId: user });

        const { uniqueId, admin, orgType } = findUser;
        const adminId = admin[0]?.adminId;
        const adminName = admin[0]?.adminName;
        const adminEmail = admin[0]?.adminEmail;
        const adminContact = admin[0]?.adminContact;

        const getLogs = await logs.findOne({ org: user });
        const notices = await Notice.find({ uniqueId: user });
        const allLeaveRequests = await leaveRequests.find({ org: user });
        const getMonthlyStudentSummary = await MonthlyStudentSummary.find({ org: user });
        const getFinalStudentSummary = await FinalStudentSummary.find({ org: user });
        const getMonthlyEmployeeSummary = await MonthlyEmployeeSummary.find({org: user});
        const getFinalEmployeeSummary = await FinalEmployeeSummary.find({org: user});
        let students = [];
        let employees = [];
        if (findUser.orgType === "college") {
            students = await CollegeStudent.find();
            employees = await Employee.find({ org: user });
            const { registerLogs, loginLogs, supportLogs, employeeSessionLogs, studentSessionLog } = getLogs;

            res.render('view-dashboards/admin', {
                org: findUser,
                uniqueId,
                admin: findUser.admin[0],
                adminName,
                adminId,
                adminContact,
                adminEmail,
                orgType,
                students,
                employees,
                registerLogs,
                loginLogs,
                supportLogs,
                employeeSessionLogs,
                studentSessionLog,
                notices,
                leaveRequests: allLeaveRequests,
                getMonthlyStudentSummary,
                getFinalStudentSummary,
                getMonthlyEmployeeSummary,
                getFinalEmployeeSummary
            });
        }
        else if (findUser.orgType == "school") {
            students = await SchoolStudent.find();
            employees = await Employee.find({ org: user });
            const { registerLogs, loginLogs, supportLogs, employeeSessionLogs, studentSessionLog } = getLogs;

            res.render('view-dashboards/admin', {
                org: findUser,
                uniqueId,
                admin: findUser.admin[0],
                adminName,
                adminId,
                adminContact,
                adminEmail,
                orgType,
                students,
                employees,
                registerLogs,
                loginLogs,
                supportLogs,
                employeeSessionLogs,
                studentSessionLog,
                notices,
                leaveRequests: allLeaveRequests,
                getMonthlyStudentSummary,
                getFinalStudentSummary,
                getMonthlyEmployeeSummary,
                getFinalEmployeeSummary,
            });
        }
        else {
            employees = await Employee.find({ org: user });
            const { registerLogs, loginLogs, supportLogs, employeeSessionLogs } = getLogs;

            res.render('view-dashboards/admin', {
                org: findUser,
                uniqueId,
                admin: findUser.admin[0],
                adminName,
                adminId,
                adminContact,
                adminEmail,
                orgType,
                employees,
                registerLogs,
                loginLogs,
                supportLogs,
                employeeSessionLogs,
                notices,
                leaveRequests: allLeaveRequests,
                getMonthlyEmployeeSummary,
                getFinalEmployeeSummary
            });
        }

    } catch (error) {
        console.error("Error loading admin dashboard:", error);
        res.status(500).send("Something went wrong.");
    }
});

module.exports = router;
