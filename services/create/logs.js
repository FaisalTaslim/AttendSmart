const RegisterLog = require("../../models/logs/register");
const LoginLog = require("../../models/logs/login");

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

module.exports = { registerLog, loginLog };
