const schoolStudent = require('../../models/SchoolStudent');
const { StudentSummary } = require('../../models/attendanceSummary');
const Org = require('../../models/Org');
const bcrypt = require('bcrypt');
const Counter = require('../../models/counter');
const Logs = require('../../models/logs')

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
            termsCheck
        } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let counterDoc = await Counter.findOne();

        const newSchoolStudentNumber = (Number(counterDoc.newStudentValue) + 1).toString();
        counterDoc.newStudentValue = newSchoolStudentNumber;
        await counterDoc.save();

        const findOrg = await Org.findOne({
            orgName: { $regex: new RegExp(`^${orgName}$`, 'i') },
            orgBranch: { $regex: new RegExp(`^${orgBranch}$`, 'i') }
        });

        console.log("✅ Org found:", findOrg);
        console.log("📛 Org uniqueId:", findOrg.uniqueId);


        if (!findOrg)
            return res.send(`<h2>❌ Error: Organization not found</h2>`);
        else {
            const subject = Array.isArray(subjectName) ? subjectName : [subjectName];
            const filteredSubjects = subject.filter(subject => subject && subject.trim() !== "");

            const newStudent = await schoolStudent.create({
                org: findOrg.uniqueId,
                uniqueId: newSchoolStudentNumber,
                userName,
                roll,
                division,
                contact,
                email,
                password: hashedPassword,
                termsCheck,
                subjects: filteredSubjects,
            });

            for (const subject of filteredSubjects) {
                const summary = {
                    org: findOrg.uniqueId,
                    student: newStudent.uniqueId,
                    subjectName: subject,
                    totalLectures: 0,
                    attendedLectures: 0,
                    percentage: 0,
                    monthlySummary: []
                };

                const createdSummary = await StudentSummary.create(summary);
                console.log(`✅ Attendance summary created: ${createdSummary.subjectName}`);
            }

            const logDoc = await Logs.findOne({ org: findOrg.uniqueId });
            if (logDoc) {
                logDoc.registerLogs.push(`Student: ${userName}, division: ${division}, roll: ${roll} joined on ${new Date().toLocaleString()}`);
                await logDoc.save();
            } else {
                console.log("⚠️ No log document found for this organization.");
            }

            findOrg.registeredStudents += 1;
            await findOrg.save();

            res.redirect('/login')
        }

    } catch (err) {
        console.error(err);
        res.send(`<h2>❌ Error: ${err.message}</h2>`);
    }
};
