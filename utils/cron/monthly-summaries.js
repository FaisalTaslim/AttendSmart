const cron = require('node-cron');
const moment = require('moment');
const mongoose = require('mongoose');

const Org = require('../../models/users/organization');
const CollegeStudent = require('../../models/users/college-student');
const SchoolStudent = require('../../models/users/school-student');
const StudentSummary = require('../../models/statistics/student-summary');
const Employee = require('../../models/users/employee');
const EmployeeSummary = require('../../models/statistics/employee-summary');

const CHUNK_SIZE = 1000;
let isRunning = false;

const bulkWriteInChunks = async (model, ops) => {
    for (let i = 0; i < ops.length; i += CHUNK_SIZE) {
        const chunk = ops.slice(i, i + CHUNK_SIZE);
        if (chunk.length > 0) {
            await model.bulkWrite(chunk, { ordered: false });
        }
    }
};

const buildStudentSummaryOps = (students, orgAttendanceMap, currentMonth, departmentKey) => {
    const ops = [];

    for (const student of students) {
        const attendanceMethod = orgAttendanceMap.get(student.org);
        if (!attendanceMethod) continue;

        const base = {
            org: student.org,
            code: student.code,
            name: student.name,
            department: student[departmentKey],
            month: currentMonth,
        };

        if (attendanceMethod === 'subject-wise') {
            const subjects = Array.isArray(student.subjects)
                ? student.subjects.map(s => (s || '').trim()).filter(Boolean)
                : [];

            for (const subject of subjects) {
                ops.push({
                    updateOne: {
                        filter: {
                            org: student.org,
                            code: student.code,
                            month: currentMonth,
                            subject,
                        },
                        update: {
                            $setOnInsert: {
                                ...base,
                                subject,
                            },
                        },
                        upsert: true,
                    },
                });
            }
        } else if (attendanceMethod === 'one-time') {
            ops.push({
                updateOne: {
                    filter: {
                        org: student.org,
                        code: student.code,
                        month: currentMonth,
                        subject: null,
                    },
                    update: {
                        $setOnInsert: {
                            ...base,
                            subject: null,
                        },
                    },
                    upsert: true,
                },
            });
        }
    }

    return ops;
};

const buildEmployeeSummaryOps = (employees, currentMonth) => {
    const ops = [];

    for (const employee of employees) {
        ops.push({
            updateOne: {
                filter: {
                    org: employee.org,
                    code: employee.code,
                    month: currentMonth,
                },
                update: {
                    $setOnInsert: {
                        org: employee.org,
                        code: employee.code,
                        name: employee.name,
                        department: employee.designation,
                        shift: employee.shift || null,
                        month: currentMonth,
                    },
                },
                upsert: true,
            },
        });
    }

    return ops;
};

const runMonthlySummaryJob = async () => {
    if (isRunning) return;
    if (mongoose.connection.readyState !== 1) return;

    isRunning = true;
    const currentMonth = moment().format('YYYY-MM');

    try {
        const orgs = await Org.find({}, { code: 1, attendanceMethod: 1 }).lean();
        const orgAttendanceMap = new Map(
            orgs.map(org => [org.code, org.attendanceMethod])
        );

        const [collegeStudents, schoolStudents] = await Promise.all([
            CollegeStudent.find({ isDeleted: false }, { org: 1, code: 1, name: 1, dept: 1, subjects: 1 }).lean(),
            SchoolStudent.find({ isDeleted: false }, { org: 1, code: 1, name: 1, standard: 1, subjects: 1 }).lean(),
        ]);

        const studentOps = [
            ...buildStudentSummaryOps(collegeStudents, orgAttendanceMap, currentMonth, 'dept'),
            ...buildStudentSummaryOps(schoolStudents, orgAttendanceMap, currentMonth, 'standard'),
        ];

        if (studentOps.length > 0) {
            await bulkWriteInChunks(StudentSummary, studentOps);
        }

        const employees = await Employee.find(
            { isDeleted: false },
            { org: 1, code: 1, name: 1, designation: 1, shift: 1 }
        ).lean();

        const employeeOps = buildEmployeeSummaryOps(employees, currentMonth);
        if (employeeOps.length > 0) {
            await bulkWriteInChunks(EmployeeSummary, employeeOps);
        }
    } catch (err) {
        console.error('Monthly summary cron failed:', err);
    } finally {
        isRunning = false;
    }
};

const startMonthlySummaryCron = () => {
    if (mongoose.connection.readyState === 1) {
        runMonthlySummaryJob();
    } else {
        mongoose.connection.once('open', () => {
            runMonthlySummaryJob();
        });
    }

    cron.schedule('5 0 1 * *', () => {
        runMonthlySummaryJob();
    });
};

module.exports = { startMonthlySummaryCron };
