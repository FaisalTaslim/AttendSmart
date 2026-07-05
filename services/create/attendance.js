const activeEmployeeSession = require("../../../models/attendance/active-employee-session");


async function createActiveEmployeeSession(data, session) {
  const [summary] = await EmployeeSummary.create([data], { session });
  return summary;
}

module.exports = { createActiveEmployeeSession };