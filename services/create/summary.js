const EmployeeSummary = require('../../models/statistics/employee-summary');
const StudentSummary = require('../../models/statistics/student-summary');

async function createEmployeeSummary(data, session) {
    const [summary] = await EmployeeSummary.create([data], { session });
    return summary;
}

async function createStudentSummary(data, session) {
    const [summary] = await StudentSummary.create([data], { session });
    return summary;
}

module.exports = { createEmployeeSummary, createStudentSummary };