const Employee = require('../../../models/users/employee');
const Org = require('../../../models/users/organization');
const studentSession = require('../../../models/logs/student-session');
const generateCode = require('../../../utils/functions/codes');
const studentSummary = require('../../../models/statistics/student-summary');
const schoolStudent = require('../../../models/users/school-student');
const collegeStudent = require('../../../models/users/college-student');
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

    console.log("Session user code:", req.session.user.code);
    console.log("Current time:", new Date());
    // 🔹 Fetch active session for this teacher
    
    const Session = await studentSession.findOne({
        code: req.session.user.code,
        status: "active",
        expiresAt: { $gt: new Date() }
    });

    console.log(Session);

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

    const month = moment().format('YYYY-MM');
    const attendanceMethod = orgData?.attendanceMethod;

    if (orgType === "college") {
        const studentQuery = {
            org: getOrg,
            dept: department
        };
        if (attendanceMethod === "subject-wise" && subject) {
            studentQuery.subjects = subject;
        }

        const students = await collegeStudent.find(studentQuery);

        if (attendanceMethod === "one-time") {
            await Promise.all(
                students.map(student =>
                    studentSummary.findOneAndUpdate(
                        { org: getOrg, code: student.code, month, subject: null },
                        {
                            $inc: { total: 1 },
                            $setOnInsert: {
                                org: getOrg,
                                code: student.code,
                                name: student.name,
                                department: student.dept,
                                subject: null,
                                month,
                            },
                        },
                        { upsert: true }
                    )
                )
            );
        } else if (attendanceMethod === "subject-wise") {
            await Promise.all(
                students.map(student =>
                    studentSummary.findOneAndUpdate(
                        { org: getOrg, code: student.code, month, subject },
                        {
                            $inc: { total: 1 },
                            $setOnInsert: {
                                org: getOrg,
                                code: student.code,
                                name: student.name,
                                department: student.dept,
                                subject,
                                month,
                            },
                        },
                        { upsert: true }
                    )
                )
            );
        }
    }

    else if (orgType === "school") {
        const studentQuery = {
            org: getOrg,
            standard: department,
            stream: stream
        };
        if (attendanceMethod === "subject-wise" && subject) {
            studentQuery.subjects = subject;
        }

        const students = await schoolStudent.find(studentQuery);

        if (attendanceMethod === "one-time") {
            await Promise.all(
                students.map(student =>
                    studentSummary.findOneAndUpdate(
                        { org: getOrg, code: student.code, month, subject: null },
                        {
                            $inc: { total: 1 },
                            $setOnInsert: {
                                org: getOrg,
                                code: student.code,
                                name: student.name,
                                department: student.standard,
                                subject: null,
                                month,
                            },
                        },
                        { upsert: true }
                    )
                )
            );
        }

        else if (attendanceMethod === "subject-wise") {
            await Promise.all(
                students.map(student =>
                    studentSummary.findOneAndUpdate(
                        { org: getOrg, code: student.code, month, subject },
                        {
                            $inc: { total: 1 },
                            $setOnInsert: {
                                org: getOrg,
                                code: student.code,
                                name: student.name,
                                department: student.standard,
                                subject,
                                month,
                            },
                        },
                        { upsert: true }
                    )
                )
            );
        }
    }

    await Session.save();

    res.redirect('/dashboard/employee/teacher');
};
