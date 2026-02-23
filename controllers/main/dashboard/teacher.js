const Employee = require('../../../models/users/employee');
const Org = require('../../../models/users/organization');
const studentSession = require('../../../models/statistics/student-session');
const generateCode = require('../../../utils/functions/codes');
const studentSummary = require('../../../models/statistics/student-summary');
const schoolStudent = require('../../../models/users/school-student');
const moment = require('moment');

exports.dashboard = async (req, res) => {
    const getEmployee = await Employee.findOne({ code: req.session.user.code });
    const setup = getEmployee?.setup?.faceUploaded === true;
    const getOrg = getEmployee.org;

    const orgData = await Org.findOne({ code: getOrg });
    const orgType = orgData?.type;

    let studentSubjects;
    let filteredSubjects = [];
    let departments = [];
    let isFound = false;

    studentSubjects = orgData?.subjects || [];

    for (const subjectArrays of studentSubjects) {
        departments.push(subjectArrays.class);

        for (const key in subjectArrays) {
            if (key !== 'minors' && key !== 'optionals' && key !== 'majors') continue;
            else {
                if (Array.isArray(subjectArrays[key]) && subjectArrays[key].length > 0) {
                    for (let i = 0; i < subjectArrays[key].length; i++) {
                        for (subject of filteredSubjects) {
                            if (subjectArrays[key][i] === subject) {
                                isFound = true;
                                break;
                            }
                        }
                        if (isFound) {
                            subjectArrays[key].splice(i, 1);
                            isFound = false;
                            break;
                        }

                        if (i === subjectArrays[key].length - 1) {
                            filteredSubjects.push(...subjectArrays[key]);
                        }
                    }
                }
            }
        }
    }

    // 🔹 Fetch active session for this teacher
    const Session = await studentSession.findOne({
        code: req.session.user.code,
        status: "active",
        expiresAt: { $gt: new Date() }
    });

    res.render('dashboard/teacher', {
        setup,
        subjects: filteredSubjects,
        Session,
        departments,
        orgType,
    });
};


exports.startSession = async (req, res) => {
    const { department, subject, stream } = req.body;

    const employee = await Employee.findOne({ code: req.session.user.code });
    const getOrg = employee.org;

    const orgData = await Org.findOne({ code: getOrg });
    const orgType = orgData?.type;

    const Session = new studentSession({
        sessionCode: generateCode(6, "numeric"),
        code: req.session.user.code,
        instigator: req.session.user.name,
        subject,
        status: "active",
        createdAt: new Date(),
        expiresAt: moment().add(1, 'hour').toDate(),
    });

    if (orgType === "college") {
        await studentSummary.findOneAndUpdate(
            { org: getOrg, department, subject },
            { $inc: { total: 1 } },
            { upsert: true }
        );
    }

    else if (orgType === "school") {
        const attendanceType = orgData?.attendanceType;

        const students = await schoolStudent.find({
            org: getOrg,
            class: department,
            stream: stream
        });

        const studentCodes = students.map(s => s.code);

        if (attendanceType === "one-time") {
            await Promise.all(
                studentCodes.map(code =>
                    studentSummary.findOneAndUpdate(
                        { code },
                        { $inc: { total: 1 } },
                        { upsert: true }
                    )
                )
            );
        }

        else if (attendanceType === "subject-wise") {
            await Promise.all(
                studentCodes.map(code =>
                    studentSummary.findOneAndUpdate(
                        { code, subject },
                        { $inc: { total: 1 } },
                        { upsert: true }
                    )
                )
            );
        }
    }

    await Session.save();

    res.redirect('/dashboard/employee/teacher');
};