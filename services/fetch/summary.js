const EmployeeSummary = require("../../models/statistics/employee-summary");
const StudentSummary = require("../../models/statistics/student-summary");

async function returnEmployeeSummary(obj, service) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }

    if (service === "one") {
      return await EmployeeSummary.findOne(obj);
    } else {
      return await EmployeeSummary.find(obj);
    }
  } catch (err) {
    throw err;
  }
}

async function returnStudentSummary(obj, service) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }

    if (service === "one") {
      return await StudentSummary.findOne(obj);
    } else {
      return await StudentSummary.find(obj);
    }
  } catch (err) {
    throw err;
  }
}

module.exports = { returnEmployeeSummary, returnStudentSummary };