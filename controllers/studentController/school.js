const schoolStudent = require('../../models/SchoolStudent');
const { StudentSummary } = require('../../models/attendanceSummary');
const Org = require('../../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../../models/counter');

exports.createSchoolStudent = async (req, res) => {
    try {
        const {
            userName,
            roll,
            division,
            contact,
            email,
            password,
            orgName,
            orgBranch,
            subjectName,
        } = req.body;

        console.log("Received subjectName from form:", subjectName);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let counterDoc = await Counter.findOne();

        const newSchoolStudentNumber = (Number(counterDoc.newStudentValue) + 1).toString();
        counterDoc.newStudentValue = newSchoolStudentNumber;
        await counterDoc.save();

        const findOrg = await Org.findOne({ orgName, orgBranch });
        if (!findOrg)
            return res.send(`<h2>❌ Error: Organization not found</h2>`);

        const newStudent = await schoolStudent.create({
            orgId: findOrg._id,
            uniqueId: newSchoolStudentNumber,
            userName,
            roll,
            division,
            contact,
            email,
            password: hashedPassword,
            attendanceSummary: []
        });

        const subjects = Array.isArray(subjectName) ? subjectName : [subjectName];
        const filteredSubjects = subjects.filter(subject => subject && subject.trim() !== "");

        for (const subject of filteredSubjects) {
            const summary = {
                student: newStudent.uniqueId,
                subjectName: subject,
                totalLectures: 0,
                attendedLectures: 0,
                percentage: 0
            };

            const createdSummary = await StudentSummary.create(summary);
            console.log(`✅ Attendance summary created: ${createdSummary.subjectName}`);

            newStudent.attendanceSummary.push(createdSummary._id);
        }

        await newStudent.save();

        res.send(`<h2>✅ Student created and attendance summaries saved!</h2>`);

    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
