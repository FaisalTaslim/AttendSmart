const collegeStudent = require('../../models/CollegeStudent');
const { FinalStudentSummary } = require('../../models/overallSummary');
const { MonthlyStudentSummary } = require('../../models/monthlySummary');
const Org = require('../../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../../models/counter');
const Logs = require('../../models/logs');
const Department = require('../../models/departments');
const moment = require('moment');

exports.createCollegeStudent = async (req, res) => {
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

        const hashedPassword = await bcrypt.hash(password, 10);

        const counterDoc = await Counter.findOne();
        const newCollegeStudentNumber = (Number(counterDoc.newStudentValue) + 1).toString();
        counterDoc.newStudentValue = newCollegeStudentNumber;
        await counterDoc.save();

        const findOrg = await Org.findOne({
            orgName: new RegExp(`^${orgName}$`, 'i'),
            orgBranch: new RegExp(`^${orgBranch}$`, 'i')
        });

        if (!findOrg) {
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        }

        const subjectArray = Array.isArray(subjectName) ? subjectName : [subjectName];
        const filteredSubjects = subjectArray.filter(sub => sub && sub.trim() !== "");
        
        const monthKey = moment().format("YYYY-MM");

        const newStudent = await collegeStudent.create({
            org: findOrg.uniqueId,
            uniqueId: newCollegeStudentNumber,
            userName,
            roll,
            dept,
            contact,
            email,
            password: hashedPassword,
            termsCheck,
            subjects: filteredSubjects,
        });

        for (const subject of filteredSubjects) {
            await FinalStudentSummary.create({
                org: findOrg.uniqueId,
                student: newStudent.uniqueId,
                studentName: newStudent.userName,
                std_dept: dept,
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
                std_dept: dept,
                subjectName: subject,
                month: monthKey,
                totalLectures: 0,
                attendedLectures: 0,
                leaveDays: 0,
                percentage: 0
            });

            console.log(`✅ Attendance summary created for subject: ${subject} for month ${monthKey}`);
        }


        await Department.findOneAndUpdate(
            { org: findOrg.uniqueId },
            { $addToSet: { collegeDepartments: dept } },
            { upsert: true, new: true }
        );

        const logMessage = `Student: ${userName}, Department: ${dept}, Roll: ${roll}, Joined on ${moment().format("DD-MM-YYYY HH:mm:ss")}`;
        const logDoc = await Logs.findOne({ org: findOrg.uniqueId });

        if (logDoc) {
            logDoc.registerLogs.push(logMessage);
            await logDoc.save();
        } else {
            console.log("⚠️ No log document found for this organization.");
        }

        findOrg.registeredStudents += 1;
        await findOrg.save();

        console.log("📝 Log saved to Org.");
        res.send(`<h2>✅ Student created and attendance summaries saved!</h2>`);

    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
