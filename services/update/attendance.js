const activeEmployeeSession = require("../../models/attendance/active-employee-session");
const activeStudentSession = require('../../models/attendance/active-student-session');

async function updateActiveEmployeeSession(obj, data, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }

    return await activeEmployeeSession.updateMany(
      obj,
      { $set: data },
      { session },
    );

  } catch (err) {
    throw err;
  }
}

async function updateActiveStudentSession(obj, data, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid object sent!");
    }

    return await activeStudentSession.updateMany(
      obj,
      { $push: data },
      { session },
    );

  } catch (err) {
    throw err;
  }
}

module.exports = {
  updateActiveEmployeeSession,
  updateActiveStudentSession,
}