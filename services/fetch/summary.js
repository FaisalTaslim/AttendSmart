const EmployeeSummary = require("../../models/statistics/employee-summary");
const StudentSummary = require("../../models/statistics/student-summary");

async function returnEmployeeSummary(obj) {
    return await EmployeeSummary.findOne(obj);
}

async function returnStudentSummary(obj) {
    return await StudentSummary.findOne(obj);
}

module.exports = {returnEmployeeSummary, returnStudentSummary};