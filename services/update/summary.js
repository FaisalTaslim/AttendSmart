const EmployeeSummary = require("../../models/statistics/employee-summary");

async function updateEmployeeSummary(obj, data, session) {
  try {
    if (typeof obj !== "object" || obj === null) {
      throw new Error("Invalid data sent for updation!");
    }
    return await EmployeeSummary.updateMany(obj, { $set: data }, { session });
    
  } catch (err) {
    throw err;
  }
}

module.exports = { updateEmployeeSummary };
