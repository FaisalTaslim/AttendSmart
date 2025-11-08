const bcrypt = require('bcrypt');
const moment = require('moment');
const collegeStudent = require('../models/CollegeStudent');
const schoolStudent = require('../models/SchoolStudent');
const employee = require('../models/Employee');
const Org = require('../models/Org');
const counter = require('../models/counter');
const logs = require('../models/logs');
const departments = require('../models/departments');

const { 
    rollbackStudentCounter,
    rollbackSummary,
    rollbackStudent,
    rollbackRegisterLog,
    rollbackEmployeeCounter,
    rollbackEmployeeSummary,
    rollbackEmployee,
    rollbackAdminCounter,
    rollbackOrg,
    rollbackDepartment
} = require('../utils/rollback-functions');

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

        const existingOrg = await Org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });
        if (existingOrg) {
            error_tracker = 1;

            return res.render('index', {
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
        await Org.create(newOrg);

        error_tracker = 4;
        await departments.create({
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
                return res.render('index', { error: error_messages[2] });

            case 3:
                await rollbackAdminCounter();
                return res.render('index', { error: error_messages[3] });

            case 4:
                await rollbackAdminCounter();
                await rollbackOrg(newAdminNumber);
                return res.render('index', { error: error_messages[4] });

            case 5:
                await rollbackAdminCounter();
                await rollbackOrg(newAdminNumber);
                await rollbackDepartment(newAdminNumber);
                return res.render('index', { error: error_messages[5] });

            default:
                return res.render('index', { error: err.message });
        }
    }
};

// ==================== STUDENT REGISTRATION ====================
async function createStudent(req, res, type) {
    let error_tracker = 0;
    let newStudentNumber, findStudentId, findOrgId, orgType, logMessage;

    const isCollege = type === 'college';
    const StudentModel = isCollege ? collegeStudent : schoolStudent;

    try {
        const {
            userName, roll, contact, email, password, orgName, orgBranch, subjectName, termsCheck,
            dept, standard
        } = req.body;

        const lowerCaseData = {
            userName: userName.toLowerCase().trim(),
            orgName: orgName.toLowerCase().trim(),
            orgBranch: orgBranch.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            dept: dept?.toLowerCase().trim(),
            standard: standard?.toLowerCase().trim()
        };

        const findOrg = await Org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });
        if (!findOrg) {
            error_tracker = 1;
            return res.render('index', { error: 'No organization found! Try again!' });
        }

        findOrgId = findOrg.uniqueId;
        orgType = findOrg.orgType;

        const findStudent = await StudentModel.findOne({
            org: findOrgId,
            userName,
            roll,
            ...(isCollege ? { dept: lowerCaseData.dept } : { standard: lowerCaseData.standard })
        });
        if (findStudent) {
            error_tracker = 2;
            return res.render('index', { error: 'Duplicate Account Creation Attempt! Login with your existing account!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        error_tracker = 3;
        const counterDoc = await counter.findOneAndUpdate({}, { $inc: { newStudentValue: 1 } }, { new: true });
        newStudentNumber = counterDoc.newStudentValue;

        const subjectArray = Array.isArray(subjectName) ? subjectName : [subjectName];
        const filteredSubjects = subjectArray.filter(sub => sub && sub.trim() !== "").map(s => s.toLowerCase());
        if (!filteredSubjects.length) {
            error_tracker = 4;
            return res.render('index', { error: "Please enter the subjects, and try again!" });
        }

        error_tracker = 5;
        const newStudent = await StudentModel.create({
            org: findOrgId,
            uniqueId: newStudentNumber,
            userName: lowerCaseData.userName,
            roll,
            ...(isCollege ? { dept: lowerCaseData.dept } : { standard: lowerCaseData.standard }),
            contact,
            email,
            onLeave: false,
            password: hashedPassword,
            termsCheck,
            subjects: filteredSubjects
        });
        findStudentId = newStudent.uniqueId;
        const monthKey = moment().format("YYYY-MM");

        error_tracker = 6;
        for (const subject of filteredSubjects) {
            await FinalStudentSummary.create({
                org: findOrgId,
                student: findStudentId,
                studentName: lowerCaseData.userName,
                std_dept: isCollege ? lowerCaseData.dept : lowerCaseData.standard.toUpperCase(),
                subjectName: subject,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });

            await MonthlyStudentSummary.create({
                org: findOrgId,
                student: findStudentId,
                studentName: lowerCaseData.userName,
                std_dept: isCollege ? lowerCaseData.dept : lowerCaseData.standard.toUpperCase(),
                subjectName: subject,
                month: monthKey,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });
        }

        error_tracker = 8;
        if (isCollege) {
            const findDept = (await departments.findOne({ org: findOrgId }))?.collegeDepartments || [];
            if (!findDept.includes(lowerCaseData.dept)) {
                await departments.findOneAndUpdate({ org: findOrgId }, { $push: { collegeDepartments: lowerCaseData.dept } });
            }
        } else {
            await departments.findOneAndUpdate(
                { org: findOrgId },
                { $addToSet: { schoolStandards: lowerCaseData.standard } },
                { upsert: true, new: true }
            );
        }

        error_tracker = 9;
        logMessage = isCollege
            ? `Student: ${userName}, Department: ${dept}, Roll: ${roll}, Joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`
            : `Student: ${userName}, Standard: ${lowerCaseData.standard}, Roll: ${roll}, Joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`;

        await logs.findOneAndUpdate({ org: findOrgId }, { $push: { registerLogs: logMessage } });

        error_tracker = 10;
        await Org.findOneAndUpdate({ org: findOrgId }, { $inc: { registeredStudents: 1 } });

        try {
            await sendRegistrationMail(lowerCaseData.email, userName, findStudentId);
        } catch (mailError) {
            console.error('❌ Failed to send registration email:', mailError.message);
        }

        return res.redirect('/login');

    } catch (err) {
        const error_messages = {
            3: 'Fatal Error: Missing counter. Contact your organization!',
            4: 'Invalid subjects entered. Try again!',
            5: "Couldn't create account! Please try again!",
            6: "Couldn't create summaries! Please try again!",
            7: "Couldn't create monthly summaries! Please try again!",
            8: "Failed to create department. Try again!",
            9: "Fatal error: Failed to create log. Contact your educational institute.",
            10: "Fatal error: Failed to update organization details. Contact your educational institute."
        };

        switch (error_tracker) {
            case 3:
            case 4:
            case 5:
                await rollbackStudentCounter(); break;
            case 6:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType); break;
            case 7:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                await rollbackSummary(findOrgId, findStudentId, "final"); break;
            case 8:
            case 9:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                await rollbackSummary(findOrgId, findStudentId, "final");
                await rollbackSummary(findOrgId, findStudentId, "monthly"); break;
            case 10:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                await rollbackSummary(findOrgId, findStudentId, "final");
                await rollbackSummary(findOrgId, findStudentId, "monthly");
                await rollbackRegisterLog(findOrgId, logMessage, "System couldn't find your document to update the registered student count!");
                break;
            default:
                console.error("Unhandled error:", err.message);
        }

        return res.render('index', {
            error: error_messages[error_tracker] || err.message
        });
    }
}

exports.createCollegeStudent = (req, res) => createStudent(req, res, 'college');
exports.createSchoolStudent = (req, res) => createStudent(req, res, 'school');


async function createEmployee(req, res) {
    let error_tracker = 0;
    let findOrgId, newEmployeeNumber, currentLogMessage, orgType;

    try {
        const {
            userName, employeeId, workType, designation, shift, dept,
            contact, email, password, orgName, orgBranch, termsCheck
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

        const findOrg = await Org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });
        if (!findOrg) return res.render('/', { error: 'No organization found! Try again!' });

        findOrgId = findOrg.uniqueId;
        orgType = findOrg.orgType;

        const existing = await employee.findOne({
            org: findOrgId,
            userName: lowerCaseData.userName,
            employeeId: lowerCaseData.employeeId,
            dept: lowerCaseData.dept
        });
        if (existing) return res.render('/', { error: 'Duplicate account!' });

        const hashedPassword = await bcrypt.hash(password, 10);

        error_tracker = 2;
        const counterDoc = await counter.findOneAndUpdate({}, { $inc: { newEmployeeValue: 1 } }, { new: true });
        newEmployeeNumber = counterDoc.newEmployeeValue;

        error_tracker = 3;
        await employee.create({
            uniqueId: newEmployeeNumber,
            org: findOrgId,
            userName: lowerCaseData.userName,
            employeeId: lowerCaseData.employeeId,
            dept: lowerCaseData.dept,
            workType, shift,
            designation: lowerCaseData.designation,
            contact, email,
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
        await MonthlyEmployeeSummary.create({
            org: findOrgId,
            employee: newEmployeeNumber,
            employeeName: lowerCaseData.userName,
            shift,
            emp_dept: lowerCaseData.dept,
            month: moment().format('YYYY-MM'),
            totalDays: 0,
            attendedDays: 0,
            leaveDays: 0,
            percentage: 0
        });

        error_tracker = 6;
        await departments.findOneAndUpdate(
            { org: findOrgId },
            { $addToSet: { employeeDepartments: lowerCaseData.dept } },
            { upsert: true, new: true }
        );

        error_tracker = 7;
        currentLogMessage = 
        `
        Employee: ${userName}, Dept: ${dept}, EmployeeID: ${employeeId}, Joined on ${moment().format('DD-MM-YYYY HH:mm:ss')}
        `

        await logs.findOneAndUpdate(
            { org: findOrgId }, 
            { $push: { registerLogs: currentLogMessage } }
        );

        error_tracker = 8;
        await Org.findOneAndUpdate(
            { uniqueId: findOrgId }, 
            { $inc: { registeredEmployees: 1 } }
        );

        try { await sendRegistrationMail(lowerCaseData.email, userName, newEmployeeNumber, 'Employee'); }
        catch (e) { console.error('Failed sending email', e); }

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
}

exports.createEmployee = createEmployee;