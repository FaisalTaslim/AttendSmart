const activeEmployeeSession = require("../../models/attendance/active-employee-session");
const activeStudentSession = require('../../models/attendance/active-student-session');
const Schedule = require("../../models/schedule/schedule");


async function returnActiveEmployeeSession(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return activeEmployeeSession.findOne(obj);
  } catch (err) {
    throw err;
  }
}

async function returnActiveStudentSession(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return activeStudentSession.findOne(obj);
  } catch (err) {
    throw err;
  }
}

async function returnSchedule(obj) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }
    return Schedule.findOne(obj);
  } catch (err) {
    throw err;
  }
}

module.exports = {
  returnActiveEmployeeSession,
  returnSchedule,
  returnActiveStudentSession,
};