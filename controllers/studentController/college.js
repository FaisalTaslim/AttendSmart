const collegeStudent = require('../../models/CollegeStudent');
const { StudentSummary } = require('../../models/attendanceSummary');
const Org = require('../../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../../models/counter');

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

        console.log("Received subjectName from form:", subjectName);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let counterDoc = await Counter.findOne();

        const newCollegeStudentNumber = (Number(counterDoc.newStudentValue) + 1).toString();
        counterDoc.newStudentValue = newCollegeStudentNumber;
        await counterDoc.save();

        const findOrg = await Org.findOne({
            orgName: { $regex: new RegExp(`^${orgName}$`, 'i') },
            orgBranch: { $regex: new RegExp(`^${orgBranch}$`, 'i') }
        });

        if (!findOrg)
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        else {
            const subject = Array.isArray(subjectName) ? subjectName : [subjectName];
            const filteredSubjects = subject.filter(subject => subject && subject.trim() !== "");

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
                attendanceSummary: []
            });

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

            const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const ip = rawIP?.split(',')[0].trim();

            findOrg.logs.push({
                logType: "registerLogs",
                ipAddress: ip,
                activity: `New college student (${userName}, roll: ${newStudent.roll}, dept: ${newStudent.dept}) registered.`,
                timestamp: Date.now()
            });

            findOrg.registeredStudents += 1;

            await findOrg.save();
            console.log("📝 Log saved to Org.");
            res.send(`<h2>✅ Student created and attendance summaries saved!</h2>`);
        }
    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
