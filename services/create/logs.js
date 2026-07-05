const RegisterLog = require("../../models/logs/register");
const LoginLog = require("../../models/logs/login");
const employeeActiveSessionLog = require("../../../models/logs/employee-attendance-history");

async function registerLog(data, session) {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid data sent!");
  }

  return RegisterLog.create([data], { session });
}

async function loginLog(data) {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid data sent!");
  }

  return LoginLog.create(data);
}

async function employeeActiveSessionLog(data) {
  if(typeof data !== "object" || data === null) {
    throw new Error("Invalid data sent!");
  }

  return employeeActiveSessionLog.create(data);
}

module.exports = { registerLog, loginLog, employeeActiveSessionLog };
