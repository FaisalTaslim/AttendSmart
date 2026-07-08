const EmployeeAttendanceHistory = require("../../models/logs/employee-attendance-history");
const StudentAttendanceHistory = require("../../models/logs/student-attendance-history");

async function returnEmployeeAttendanceHistory(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return await EmployeeAttendanceHistory.findOne(obj);
  } catch (err) {
    throw err;
  }
}

async function returnStudentAttendanceHistory(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return await StudentAttendanceHistory.findOne(obj);
  } catch (err) {
    throw err;
  }
}

function returnIndex(history, code) {
  const result = history.history.findIndex((h) => h.code === code);

  if (result >= 0) {
    return result;
  } else {
    return -1;
  }
}


module.exports = {
  returnEmployeeAttendanceHistory,
  returnStudentAttendanceHistory,
  returnIndex,
};