const collegeStudent = require('../../models/CollegeStudent');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const Org = require('../../models/organization');
const bcrypt = require('bcrypt');
const counter = require('../../models/codes');
const logs = require('../../models/logs');
const department = require('../../models/departments');
const moment = require('moment');
const sendRegistrationMail = require('../../utils/send-emails');


exports.createCollegeStudent = async (req, res) => {
    let error_tracker = 0;
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
            userName: userName.toLowerCase().trim(),
            orgName: orgName.toLowerCase().trim(),
            orgBranch: orgBranch.toLowerCase(),
            dept: dept.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            roll: roll.toLowerCase().trim()
        };

        const findOrg = await Org.findOne({ orgName: lowerCaseData.orgName, orgBranch: lowerCaseData.orgBranch });
        console.log("Found Org \n: ", findOrg);

        if (!findOrg) {
            error_tracker = 1;
            return res.render('index', { error: 'No organization found! Try again!' });
        }

        findOrgId = findOrg.uniqueId;
        orgType = findOrg.orgType;

        const findStudent = await collegeStudent.findOne({
            org: findOrgId,
            userName: lowerCaseData.userName,
            roll: lowerCaseData.roll,
            dept: lowerCaseData.dept
        });

        console.log(findStudent);
        if (findStudent) {
            error_tracker = 2;
            return res.render('index', { error: 'Duplicate Account Creation Attempt! Login with your existing account!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        error_tracker = 3;
        const counterDoc = await counter.findOneAndUpdate(
            {},
            { $inc: { newStudentValue: 1 } },
            { new: true }
        );

        newCollegeStudentNumber = counterDoc.newStudentValue;

        const subjectArray = Array.isArray(subjectName) ? subjectName : [subjectName];
        const filteredSubjects = subjectArray.filter(sub => sub && sub.trim() !== "").map(s => s.toLowerCase());

        if (!filteredSubjects.length) {
            error_tracker = 4;
            return res.render('index', { error: "Please enter the subjects, and try again!" });
        }

        error_tracker = 5;
        const newStudent = await collegeStudent.create({
            org: findOrgId,
            uniqueId: newCollegeStudentNumber,
            userName: lowerCaseData.userName,
            roll,
            dept: lowerCaseData.dept,
            contact,
            email,
            onLeave: false,
            password: hashedPassword,
            termsCheck,
            subjects: filteredSubjects,
        });

        findStudentId = newStudent.uniqueId;
        const monthKey = moment().format("YYYY-MM");

        error_tracker = 6;
        for (const subject of filteredSubjects) {
            await FinalStudentSummary.create({
                org: findOrgId,
                student: findStudentId,
                studentName: lowerCaseData.userName,
                std_dept: lowerCaseData.dept,
                subjectName: subject,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });
        }

        error_tracker = 7;
        for (const subject of filteredSubjects) {
            await MonthlyStudentSummary.create({
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
        }

        error_tracker = 8;
        const findDept = (await department.findOne({ org: findOrgId }))?.collegeDepartments;
        let matchedDept = false;
        for (const dept of findDept) {
            if (dept === lowerCaseData.dept) {
                matchedDept = true;
                break;
            }
        }
        if (matchedDept == false) {
            await department.findOneAndUpdate(
                { org: findOrgId },
                { $push: { collegeDepartments: lowerCaseData.dept } }
            )
        };

        error_tracker = 9;
        logMessage = `Student: ${userName}, Department: ${dept}, Roll: ${roll}, Joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`;
        await logs.findOneAndUpdate(
            { org: findOrg.uniqueId },
            { $push: { registerLogs: logMessage } },
        );

        error_tracker = 10;
        await Org.findOneAndUpdate(
            { org: findOrgId },
            { $inc: { registeredStudents: 1 } }
        );

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
                await rollbackStudentCounter();
                break;

            case 6:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                break;

            case 7:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                await rollbackSummary(findOrgId, findStudentId, "final");
                break;

            case 8:
            case 9:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                await rollbackSummary(findOrgId, findStudentId, "final");
                await rollbackSummary(findOrgId, findStudentId, "monthly");
                break;

            case 10:
                await rollbackStudentCounter();
                await rollbackStudent(findOrgId, findStudentId, orgType);
                await rollbackSummary(findOrgId, findStudentId, "final");
                await rollbackSummary(findOrgId, findStudentId, "monthly");
                await rollbackRegisterLog(findOrgId, logMessage, "System couldn't find your document to update the registered student count!");
                break;

            default:
                console.error("Unhandled error:", err.message);
                break;
        }

        return res.render('index', { error: error_messages[error_tracker] || err.message });
    }
};
