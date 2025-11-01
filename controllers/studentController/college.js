const collegeStudent = require('../../models/CollegeStudent');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const Org = require('../../models/Org');
const bcrypt = require('bcrypt');
const counter = require('../../models/counter');
const logs = require('../../models/logs');
const department = require('../../models/departments');
const moment = require('moment');
const { rollbackStudentCounter, rollbackSummary, rollbackStudent, rollbackRegisterLog } = require('../utils/rollback-functions');

exports.createCollegeStudent = async (req, res) => {
    let error_tracker;
    let newCollegeStudentNumber;
    let findStudentId;
    let findOrgId;
    let orgType;
    let logMessage;

    try {
        const {
            userName,
            roll,
            dept,
            contact,
            email,
            password,
            orgName,
            orgBranch,
            subjectName,
            termsCheck
        } = req.body;

        const lowerCaseData = {
            userName: userName.toLowerCase(),
            orgName: orgName.toLowerCase(),
            orgBranch: orgBranch.toLowerCase(),
            dept: dept.toLowerCase()
        }

        const findOrg = await Org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });

        if (!findOrg) {
            error_tracker = 1;

            return res.render('register/school-register', {
                error: 'No organization found! Try again!'
            });
        }

        findOrgId = findOrg.uniqueId;
        orgType = findOrg.orgType;

        const findStudent = await collegeStudent.findOne({ org: findOrgId, userName: userName, roll: roll, dept: lowerCaseData.dept });
        if (findStudent) {
            error_tracker = 2;

            return res.render('register/college-register', {
                error: 'Duplicate Account Creation Attempt! Login with your existing account!'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const counterDoc = await counter.findOneAndUpdate(
            {},
            { $inc: { newStudentValue: 1 } },
            { new: true }
        )

        if (!counterDoc) {
            error_tracker = 3;

            return res.render('register/college-register', {
                error: 'Fatal Error: Missing counter! Contact developers or your organization!'
            });
        }

        newCollegeStudentNumber = counterDoc.newStudentValue;

        const subjectArray = Array.isArray(subjectName) ? subjectName : [subjectName];
        const filteredSubjects = subjectArray.filter(sub => sub && sub.trim() !== "");

        if (!filteredSubjects) {
            error_tracker = 4;

            return res.render('register/college-register', {
                error: "Please enter the subjects, and try again!"
            });
        }

        const monthKey = moment().format("YYYY-MM");

        const newStudent = await collegeStudent.create({
            org: findOrgId,
            uniqueId: newCollegeStudentNumber,
            userName,
            roll,
            dept: dept.toUpperCase(),
            contact,
            email,
            onLeave: false,
            password: hashedPassword,
            termsCheck,
            subjects: filteredSubjects,
        });

        if (!newStudent) {
            error_tracker = 5;

            return res.render('register/college-register', {
                error: "Couldn't create account! Please try again!"
            });
        }

        findStudentId = newStudent.uniqueId;

        for (const subject of filteredSubjects) {
            const newFinalSummary = await FinalStudentSummary.create({
                org: findOrgId,
                student: findStudentId,
                studentName: newStudent.userName,
                std_dept: lowerCaseData.dept,
                subjectName: subject,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });

            if (!newFinalSummary) {
                error_tracker = 6;

                return res.render('register/college-register', {
                    error: "Couldn't create summaries! Please try again!"
                });
            }
        }

        for (const subject of filteredSubjects) {
            const newMonthlySummary = await MonthlyStudentSummary.create({
                org: findOrgId,
                student: findStudentId,
                studentName: newStudent.userName,
                std_dept: lowerCaseData.dept,
                subjectName: subject,
                month: monthKey,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });

            if (!newMonthlySummary) {
                error_tracker = 7;

                return res.render('register/college-register', {
                    error: "Couldn't create summaries! Please try again!"
                });
            }
        }


        const pushDept = await department.findOneAndUpdate(
            { org: findOrgId },
            { $push: { collegeDepartments: dept } },
        );

        if (!pushDept) {
            error_tracker = 8;

            return res.render('register/college-register', {
                error: "Failed to create! Try again!"
            });
        }

        logMessage = `Student: ${userName}, Department: ${dept}, Roll: ${roll}, Joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`;
        const logDoc = await logs.findOneAndUpdate(
            { org: findOrg.uniqueId },
            { $push: { registerLogs: logMessage } },
        );

        if (!logDoc) {
            error_tracker = 9;

            return res.render('register/college-register', {
                error: "Fatal error: Failed to create log. Contact your educational institute"
            });
        }

        const updatedOrg = await Org.findOneAndUpdate(
            { org: findOrgId },
            { $inc: { registeredStudents: 1 } }
        )

        if (!updatedOrg) {
            error_tracker = 10;

            return res.render('register/college-register', {
                error: "Fatal error: Failed to create. Organization details not available. Contact your educational institute"
            });
        }

        res.redirect('/login');

    } catch (err) {
        if(error_tracker == 3 || error_tracker == 4 || error_tracker == 5) await rollbackStudentCounter();
        else if(error_tracker == 6) {
            await rollbackStudentCounter();
            await rollbackStudent(findOrgId, findStudentId, orgType);
        }
        else if(error_tracker == 7) {
            await rollbackStudentCounter();
            await rollbackStudent(findOrgId, findStudentId, orgType);
            await rollbackSummary(findOrgId, findStudentId, "final");
        }
        else if(error_tracker == 8 || error_tracker == 9) {
            await rollbackStudentCounter();
            await rollbackStudent(findOrgId, findStudentId, orgType);
            await rollbackSummary(findOrgId, findStudentId, "final");
            await rollbackSummary(findOrgId, findStudentId, "monthly");
        }
        else if(error_tracker == 10) {
            await rollbackStudentCounter();
            await rollbackStudent(findOrgId, findStudentId, orgType);
            await rollbackSummary(findOrgId, findStudentId, "final");
            await rollbackSummary(findOrgId, findStudentId, "monthly");
            await rollbackRegisterLog(findOrgId, logMessage, "System couldn't find your document to update the registered student count!");
        }
    }
};
