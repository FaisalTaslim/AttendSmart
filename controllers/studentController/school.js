const schoolStudent = require('../../models/SchoolStudent');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const Org = require('../../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../../models/counter');
const Logs = require('../../models/logs');
const Departments = require('../../models/departments');
const moment = require('moment');

exports.createSchoolStudent = async (req, res) => {
    try {
        const {
            userName,
            roll,
            standard,
            contact,
            email,
            password,
            orgName,
            orgBranch,
            subjectName,
            termsCheck
        } = req.body;

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let counterDoc = await Counter.findOne();
        const newSchoolStudentNumber = (Number(counterDoc.newStudentValue) + 1).toString();
        counterDoc.newStudentValue = newSchoolStudentNumber;
        await counterDoc.save();

        // find org
        const findOrg = await Org.findOne({
            orgName: { $regex: new RegExp(`^${orgName}$`, 'i') },
            orgBranch: { $regex: new RegExp(`^${orgBranch}$`, 'i') }
        });

        if (!findOrg) {
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        }

        // subjects
        const subjectList = Array.isArray(subjectName) ? subjectName : [subjectName];
        const filteredSubjects = subjectList.filter(s => s && s.trim() !== "");

        // create student
        const newStudent = await schoolStudent.create({
            org: findOrg.uniqueId,
            uniqueId: newSchoolStudentNumber,
            userName,
            roll,
            standard,
            contact,
            email,
            password: hashedPassword,
            termsCheck,
            subjects: filteredSubjects,
        });

        const monthKey = moment().format("YYYY-MM");

        for (const subject of filteredSubjects) {
            await FinalStudentSummary.create({
                org: findOrg.uniqueId,
                student: newStudent.uniqueId,
                studentName: newStudent.userName,
                std_dept: standard,
                subjectName: subject,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });
            console.log(`✅ Attendance summary created for subject: ${subject}`);
        }
        
        for (const subject of filteredSubjects) {
            await MonthlyStudentSummary.create({
                org: findOrg.uniqueId,
                student: newStudent.uniqueId,
                studentName: newStudent.userName,
                std_dept: standard,
                subjectName: subject,
                month: monthKey,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });

            console.log(`✅ Attendance summary created for subject: ${subject} for month ${monthKey}`);
        }

        await Departments.findOneAndUpdate(
            { org: findOrg.uniqueId },
            { $addToSet: { schoolStandards: standard } },
            { upsert: true, new: true }
        );

        const logDoc = await Logs.findOne({ org: findOrg.uniqueId });
        if (logDoc) {
            logDoc.registerLogs.push(
                `Student: ${userName}, standard: ${standard}, roll: ${roll} joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`
            );
            await logDoc.save();
        } else {
            console.log("⚠️ No log document found for this organization.");
        }

        findOrg.registeredStudents += 1;
        await findOrg.save();

        console.log("📝 Student created, logs and classes updated.");
        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
